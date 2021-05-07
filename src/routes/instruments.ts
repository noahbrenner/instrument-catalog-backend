import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { getAllInstruments, getInstrumentById } from "#db/instrument";

const router = Router();

router.get("/all", async (_req, res) => {
  const instruments = await getAllInstruments();
  res.status(StatusCodes.OK).json({ instruments });
});

router.get("/:id", async (req, res) => {
  if (!/^[0-9]+$/.test(req.params.id)) {
    const error = "Instrument ID must be an integer.";
    res.status(StatusCodes.BAD_REQUEST).json({ error });
    return;
  }

  const instrumentId = Number(req.params.id);
  const instrument = await getInstrumentById(instrumentId);

  if (instrument === null) {
    const error = `Instrument not found with id: ${instrumentId}`;
    res.status(StatusCodes.NOT_FOUND).json({ error });
  } else {
    res.status(StatusCodes.OK).json(instrument);
  }
});

export { router as instrumentRouter };
