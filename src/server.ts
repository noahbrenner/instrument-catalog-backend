import cookieParser from "cookie-parser";
import express from "express";
import type { ErrorRequestHandler } from "express";
import "express-async-errors";
import helmet from "helmet";
import { StatusCodes } from "http-status-codes";
import morgan from "morgan";

import { logger } from "#shared/logger";
import { baseRouter } from "./routes";

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
app.use("/api", baseRouter);

// Print API errors
app.use(((err: Error, _req, res, _next) => {
  logger.error(err.message, err);
  return res.status(StatusCodes.BAD_REQUEST).json({
    error: err.message,
  });
}) as ErrorRequestHandler);

// Export express instance
export { app };
