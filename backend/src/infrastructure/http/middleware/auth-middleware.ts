import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";

import { SESSION_COOKIE_NAME } from "@config/auth.js";
import { authenticateSession } from "@infrastructure/composition.js";
import type { AppEnv } from "@infrastructure/http/types.js";

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const sessionToken = getCookie(c, SESSION_COOKIE_NAME);

  if (!sessionToken) {
    return c.json(
      {
        message: "Authentication required.",
      },
      401,
    );
  }

  const user = await authenticateSession(sessionToken);

  if (!user) {
    return c.json(
      {
        message: "Invalid or expired session.",
      },
      401,
    );
  }

  c.set("user", {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  await next();
});
