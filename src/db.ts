import { createPool } from "slonik";

export const pool = createPool(process.env.POSTGRES_CONNECTION_STRING ?? "");
