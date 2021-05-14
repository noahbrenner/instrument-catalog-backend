import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { categoryIdExists } from "#db/category";
import {
  deleteInstrumentById,
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

router
  .route("/:id")
  /** Validate the instrument ID format for all methods */
  .all<{ id: string }>((req, res, next) => {
    if (/^[0-9]+$/.test(req.params.id)) {
      next();
    } else {
      const error = "Instrument ID must be an integer.";
      res.status(StatusCodes.BAD_REQUEST).json({ error });
    }
  })
  .get<{ id: string }>(async (req, res) => {
    const instrumentId = Number(req.params.id);
    const instrument = await getInstrumentById(instrumentId);

    if (instrument === null) {
      const error = `No instrument found with id: ${instrumentId}`;
      res.status(StatusCodes.NOT_FOUND).json({ error });
    } else {
      res.status(StatusCodes.OK).json(instrument);
    }
  })
  .delete<{ id: string }>(requireAuth, async (req, res) => {
    assertAuthRequest(req);
    const instrumentId = Number(req.params.id);
    const instrument = await getInstrumentById(instrumentId);

    if (!instrument) {
      res.sendStatus(StatusCodes.NO_CONTENT);
    } else if (req.user.isAdmin || instrument.userId === req.user.id) {
      await deleteInstrumentById(instrumentId);
      res.sendStatus(StatusCodes.NO_CONTENT);
    } else {
      const error = "You don't have permission to delete this instrument";
      res.status(StatusCodes.FORBIDDEN).json({ error });
    }
  });

export { router as instrumentRouter };
