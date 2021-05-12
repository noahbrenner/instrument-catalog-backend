import { pool } from "#db/index";
import { resetAllTables } from "../seed";
import { authServer } from "./mocks/auth_server";

beforeAll(() => authServer.listen());
beforeEach(resetAllTables);
afterAll(async () => {
  authServer.close();
  await resetAllTables();
  await pool.end();
});
