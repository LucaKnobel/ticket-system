import { Hono } from "hono";

import { logger } from "@infrastructure/logging/logger.js";
import { requireAuth } from "@infrastructure/http/middleware/auth-middleware.js";
import { requireAdmin } from "@infrastructure/http/middleware/require-admin.js";
import { listUsers } from "@infrastructure/composition.js";
import { toUserSummaryResponseDto } from "@infrastructure/mappers/user-mapper.js";
import type { AppEnv } from "@infrastructure/http/types.js";

export const userRoutes = new Hono<AppEnv>();

userRoutes.use("*", requireAuth);
userRoutes.use("*", requireAdmin);

userRoutes.get("/", async (c) => {
  logger.info("List users requested", {
    method: c.req.method,
    path: c.req.path,
  });

  const users = await listUsers();

  return c.json(users.map(toUserSummaryResponseDto), 200);
});
