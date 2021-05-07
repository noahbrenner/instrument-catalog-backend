import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { getAllInstruments } from "#db/instrument";

const router = Router();

router.get("/all", async (_req, res) => {
  const instruments = await getAllInstruments();
  res.status(StatusCodes.OK).json({ instruments });
});

export { router as instrumentRouter };
