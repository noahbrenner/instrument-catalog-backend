import { Router } from "express";

import { categoryRouter } from "./categories";

const router = Router();

router.use("/categories", categoryRouter);

export { router as baseRouter };
