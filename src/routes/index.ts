import { Router } from "express";

import { userRouter } from "./users";

// Init router and path
const router = Router();

// Add sub-routes
router.use("/users", userRouter);

// Export the base-router
export { router as baseRouter };
