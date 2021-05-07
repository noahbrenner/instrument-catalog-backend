import { pool } from "#db/index";
import { resetAllTables } from "../seed";

beforeEach(resetAllTables);
afterAll(async () => {
  await resetAllTables();
  await pool.end();
});
