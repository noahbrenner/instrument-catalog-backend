import { createPool } from "slonik";

export { sql } from "slonik";

export const pool = createPool(process.env.POSTGRES_CONNECTION_STRING ?? "");
