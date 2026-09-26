// Part: 1
import { env } from "./config/env.js";
import app from "./app.js";
import { prisma } from "./config/prisma.js";
import { logger } from "./utils/logger.js";



// Part: 2
const server = app.listen(env.port);
server.once("listening", () => {
  logger.info("✅Server started", { port: env.port, environment: env.nodeEnv });
});


Part: 3
let shuttingDown = false;
const shutdown = (reason: string, exitCode = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info("Server shutting down", { reason });

  const timeout = setTimeout(() => {
    logger.error("Shutdown timed out");
    server.closeAllConnections();
    process.exit(1);
  }, 10000);
  timeout.unref();

  server.close(async (error) => {
    try {
      await prisma.$disconnect();
      if (error) exitCode = 1;
      if (exitCode === 0) {
        logger.info("✅ Server shut down successfully. All connections closed.", { exitCode });
      } else {
        logger.error("❌ Server stopped due to an error.", { exitCode });
      }
    } catch {
      logger.error("Database disconnect failed");
      exitCode = 1;
    } finally {
      clearTimeout(timeout);
      process.exit(exitCode);
    }
  });
};

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
server.on("error", (error: NodeJS.ErrnoException) => {
  logger.error("HTTP server error", { code: error.code, detail: error.message, port: env.port });
  shutdown("HTTP server error", 1);
});
process.once("uncaughtException", () => shutdown("Uncaught exception", 1));
process.once("unhandledRejection", () => shutdown("Unhandled rejection", 1));
