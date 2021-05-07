import { app } from "#server";
import { logger } from "#shared/logger";
import { pool } from "#db/index";

// Start the server
const port = Number(process.env.PORT) || 3000;
const server = app.listen(port, () => {
  logger.info(`Express server started on port: ${port}`);
});

function cleanup() {
  server.close(async () => {
    await pool.end();
  });
}

["SIGINT", "SIGTERM", "SIGHUP"].forEach((sig) => process.on(sig, cleanup));
