import path from "path";

import { setupSlonikMigrator } from "@slonik/migrator";

import { pool } from "./src/db";

export const migrator = setupSlonikMigrator({
  migrationsPath: path.join(__dirname, "migrations"),
  slonik: pool,
  mainModule: module, // Make migrate.ts runnable as a CLI script
});
