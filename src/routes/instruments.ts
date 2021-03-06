import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { categoryIdExists } from "#db/category";
import {
  createInstrument,
  deleteInstrumentById,
  getAllInstruments,
  getInstrumentById,
  getInstrumentsByCategoryId,
  updateInstrumentById,
} from "#db/instrument";
import { isAuthRequest, requestUserCanModify, requireAuth } from "#shared/auth";
import { isInstrumentWithUserDefinedFields } from "#shared/typeguard";

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

router.post("/", requireAuth, async (req, res) => {
  if (!isAuthRequest(req)) {
    // requireAuth shouldn't allow us to reach this branch
    const error = "Mismatch in authentication checks";
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  } else if (!isInstrumentWithUserDefinedFields(req.body)) {
    const error = "Invalid request body";
    res.status(StatusCodes.BAD_REQUEST).json({ error });
  } else {
    const newInstrument = await createInstrument(req.user.id, req.body);
    res.status(StatusCodes.OK).json(newInstrument);
  }
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
  .put<{ id: string }>(requireAuth, async (req, res) => {
    const instrumentId = Number(req.params.id);
    const instrument = await getInstrumentById(instrumentId);

    if (instrument === null) {
      const error = `No instrument found with id: ${instrumentId}`;
      res.status(StatusCodes.NOT_FOUND).json({ error });
    } else if (!requestUserCanModify(req, instrument)) {
      const error = "You don't have permission to delete this instrument";
      res.status(StatusCodes.FORBIDDEN).json({ error });
    } else if (!isInstrumentWithUserDefinedFields(req.body)) {
      const error = "Invalid request body";
      res.status(StatusCodes.BAD_REQUEST).json({ error });
    } else if (!(await categoryIdExists(req.body.categoryId))) {
      const error = `Unknown categoryId: ${req.body.categoryId}`;
      res.status(StatusCodes.BAD_REQUEST).json({ error });
    } else {
      const updated = await updateInstrumentById(instrumentId, req.body);
      res.status(StatusCodes.OK).json(updated);
    }
  })
  .delete<{ id: string }>(requireAuth, async (req, res) => {
    const instrumentId = Number(req.params.id);
    const instrument = await getInstrumentById(instrumentId);

    if (instrument === null) {
      res.sendStatus(StatusCodes.NO_CONTENT);
    } else if (!requestUserCanModify(req, instrument)) {
      const error = "You don't have permission to delete this instrument";
      res.status(StatusCodes.FORBIDDEN).json({ error });
    } else {
      await deleteInstrumentById(instrumentId);
      res.sendStatus(StatusCodes.NO_CONTENT);
    }
  });

export { router as instrumentRouter };
