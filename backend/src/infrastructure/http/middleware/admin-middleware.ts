import { createMiddleware } from "hono/factory";

import type { AppEnv } from "@infrastructure/http/types.js";

/**
 * Restricts access to administrators only.
 */
export const requireAdmin = createMiddleware<AppEnv>(async (c, next) => {
  const user = c.var.user;

  if (user.role !== "ADMIN") {
    return c.json(
      {
        message: "Admin access required.",
      },
      403,
    );
  }

  await next();
});
