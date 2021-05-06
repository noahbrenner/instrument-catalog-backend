import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { getAllCategories } from "#db/category";

const router = Router();

router.get("/all", async (_req, res) => {
  const categories = await getAllCategories();
  return res.status(StatusCodes.OK).json({ categories });
});

export { router as categoryRouter };
