import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

import { env } from "@config/env.js";
import { SESSION_MAX_AGE_SECONDS, SESSION_COOKIE_NAME } from "@config/auth.js";
import { logger } from "@infrastructure/logging/logger.js";
import { requireAuth } from "@infrastructure/http/middleware/auth-middleware.js";
import { LoginRequestSchema } from "@ticket-system/shared";
import {
  authenticateSession,
  loginUser,
  logoutUser,
} from "@infrastructure/composition.js";
import { toLoginUserResponseDto } from "@infrastructure/mappers/user-mapper.js";

/**
 * Auth routes for login and logout.
 */
export const authRoutes = new Hono();

authRoutes.post("/login", zValidator("json", LoginRequestSchema), async (c) => {
  logger.info("Login attempt received", {
    method: c.req.method,
    path: c.req.path,
  });

  const data = c.req.valid("json");
  const result = await loginUser(data);

  setCookie(c, SESSION_COOKIE_NAME, result.sessionToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "Strict",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  logger.info("Login succeeded", {
    userId: result.user.id,
    path: c.req.path,
  });

  return c.json(toLoginUserResponseDto(result.user), 200);
});

authRoutes.get("/session", requireAuth, async (c) => {
  logger.info("Session check requested", {
    method: c.req.method,
    path: c.req.path,
  });

  const sessionToken = getCookie(c, SESSION_COOKIE_NAME);

  if (!sessionToken) {
    return c.body(null, 401);
  }

  const user = await authenticateSession(sessionToken);

  if (!user) {
    return c.body(null, 401);
  }

  return c.json(toLoginUserResponseDto(user), 200);
});

authRoutes.post("/logout", requireAuth, async (c) => {
  logger.info("Logout attempt received", {
    method: c.req.method,
    path: c.req.path,
  });

  const sessionToken = getCookie(c, SESSION_COOKIE_NAME);

  await logoutUser({ sessionToken });

  deleteCookie(c, SESSION_COOKIE_NAME, {
    path: "/",
    secure: env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  logger.info("Logout succeeded", {
    path: c.req.path,
  });

  return c.body(null, 204);
});
