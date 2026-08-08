import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

import { env } from "@config/env.js";
import { SESSION_MAX_AGE_SECONDS, SESSION_COOKIE_NAME } from "@config/auth.js";
import { logger } from "@infrastructure/logging/logger.js";
import { LoginRequestSchema } from "@ticket-system/shared/dto/auth";
import { loginUser, logoutUser } from "@infrastructure/composition.js";
import { toLoginUserResponseDto } from "@infrastructure/mappers/user-mapper.js";
import { InvalidCredentialsError } from "@application/errors/auth-errors.js";

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

  return c.json({ user: toLoginUserResponseDto(result.user) }, 200);
});

authRoutes.post("/logout", async (c) => {
  const sessionToken = getCookie(c, SESSION_COOKIE_NAME);

  await logoutUser({ sessionToken });

  deleteCookie(c, SESSION_COOKIE_NAME, {
    path: "/",
    secure: env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  return c.body(null, 204);
});

authRoutes.onError((err, c) => {
  if (err instanceof InvalidCredentialsError) {
    logger.warn("Login failed due to invalid credentials", {
      method: c.req.method,
      path: c.req.path,
    });

    return c.json(
      {
        message: "Invalid email or password.",
      },
      401,
    );
  }

  logger.error(
    "Unhandled application error",
    {
      method: c.req.method,
      path: c.req.path,
    },
    err,
  );

  return c.json(
    {
      message: "Internal server error.",
    },
    500,
  );
});
