import { Hono } from "hono";

import { requireAuth } from "@infrastructure/http/middleware/auth-middleware.js";
import type { AppEnv } from "@infrastructure/http/types.js";

export const ticketRoutes = new Hono<AppEnv>();

ticketRoutes.use("*", requireAuth);

ticketRoutes.get("/", async (c) => {
  const user = c.var.user;

  return c.json({
    message: "Tickets endpoint",
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
    },
  });
});
