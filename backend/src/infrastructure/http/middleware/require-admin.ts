import type { Context, Next } from "hono";

import type { AppEnv } from "@infrastructure/http/types.js";

/**
 * Ensures that the request is performed by an admin user.
 */
export const requireAdmin = async (c: Context<AppEnv>, next: Next) => {
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
};
