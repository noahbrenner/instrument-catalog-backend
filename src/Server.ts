import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";

import express, { ErrorRequestHandler } from "express";
import { BAD_REQUEST } from "http-status-codes";
import "express-async-errors";

import { logger } from "@shared/Logger";
import { BaseRouter } from "./routes";

// Init express
const app = express();

// Basic Express configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Show routes called in console during development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Security
app.use(
  // As a REST API, we serve only JSON -- Thus, no content should (or even can)
  // be loaded from documents served from our origin
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
      },
    },
    frameguard: {
      action: "deny",
    },
  })
);

// Allow API calls from the frontend, which is hosted separately
const allowedOrigin = process.env.ACCESS_CONTROL_ALLOW_ORIGIN;
if (allowedOrigin) {
  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", allowedOrigin);
    next();
  });
}

// Add APIs
app.use("/api", BaseRouter);

// Print API errors
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Error handlers require 4 params
app.use(((err: Error, req, res, next) => {
  logger.error(err.message, err);
  return res.status(BAD_REQUEST).json({
    error: err.message,
  });
}) as ErrorRequestHandler);

// Export express instance
export { app };
