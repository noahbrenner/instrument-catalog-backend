import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { getAllCategories, getCategoryBySlug } from "#db/category";

const router = Router();

router.get("/all", async (_req, res) => {
  const categories = await getAllCategories();
  res.status(StatusCodes.OK).json({ categories });
});

router.get("/:slug", async (req, res) => {
  const categorySlug = req.params.slug.toLowerCase();
  const category = await getCategoryBySlug(categorySlug);

  if (category === null) {
    const error = `Category not found: ${categorySlug}`;
    res.status(StatusCodes.NOT_FOUND).json({ error });
  } else {
    res.status(StatusCodes.OK).json(category);
  }
});

export { router as categoryRouter };
