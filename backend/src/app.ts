import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";

/* Logging */
import { logger } from "@infrastructure/logging/logger.js";
import { errorHandler } from "@infrastructure/http/error-handler.js";
import { authRoutes } from "@infrastructure/http/routes/auth-routes.js";
import { ticketRoutes } from "@infrastructure/http/routes/ticket-routes.js";
import { userRoutes } from "@infrastructure/http/routes/user-routes.js";

export const app = new Hono();

app.use(secureHeaders());

app.use("*", async (c, next) => {
  const startedAt = Date.now();

  await next();

  logger.info("HTTP request completed", {
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    durationMs: Date.now() - startedAt,
  });
});

app.get("/health", (c) => {
  logger.debug("Health check requested.", {
    method: c.req.method,
    path: c.req.path,
  });

  return c.json({ status: "ok" }, 200);
});

app.route("/auth", authRoutes);
app.route("/tickets", ticketRoutes);
app.route("/users", userRoutes);

app.onError(errorHandler);
