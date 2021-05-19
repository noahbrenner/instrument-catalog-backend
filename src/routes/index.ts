import { Router } from "express";

import { categoryRouter } from "./categories";
import { instrumentRouter } from "./instruments";

const router = Router();

router.use("/categories", categoryRouter);
router.use("/instruments", instrumentRouter);

export { router as baseRouter };
