import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { categoryIdExists } from "#db/category";
import {
  getAllInstruments,
  getInstrumentById,
  getInstrumentsByCategoryId,
} from "#db/instrument";
import { assertAuthRequest, requireAuth } from "#shared/auth";

const router = Router();

router.get("/all", async (_req, res) => {
  const instruments = await getAllInstruments();
  res.status(StatusCodes.OK).json({ instruments });
});

/** GET /instruments?cat=<category_id> */
router.get("/", async (req, res) => {
  const rawCategoryId = req.query.cat;

  if (rawCategoryId === undefined) {
    const error = 'Endpoint requires an instrument ID, category ID or "/all".';
    res.status(StatusCodes.BAD_REQUEST).json({ error });
    return;
  }

  if (typeof rawCategoryId !== "string" || !/^[0-9]+$/.test(rawCategoryId)) {
    const error = "Category ID must be an integer";
    res.status(StatusCodes.BAD_REQUEST).json({ error });
    return;
  }

  const categoryId = Number(rawCategoryId);
  const categoryExists = await categoryIdExists(categoryId);

  if (!categoryExists) {
    const error = `No category found with id: ${categoryId}`;
    res.status(StatusCodes.NOT_FOUND).json({ error });
    return;
  }

  const instruments = await getInstrumentsByCategoryId(categoryId);
  res.status(StatusCodes.OK).json({ instruments });
});

router.get("/test", requireAuth, (req, res) => {
  assertAuthRequest(req);
  const { id: userId, isAdmin } = req.user;
  res.status(200).json({ userId, isAdmin });
});

router.get<{ id: string }>("/:id", async (req, res) => {
  if (!/^[0-9]+$/.test(req.params.id)) {
    const error = "Instrument ID must be an integer.";
    res.status(StatusCodes.BAD_REQUEST).json({ error });
    return;
  }

  const instrumentId = Number(req.params.id);
  const instrument = await getInstrumentById(instrumentId);

  if (instrument === null) {
    const error = `No instrument found with id: ${instrumentId}`;
    res.status(StatusCodes.NOT_FOUND).json({ error });
  } else {
    res.status(StatusCodes.OK).json(instrument);
  }
});

export { router as instrumentRouter };
