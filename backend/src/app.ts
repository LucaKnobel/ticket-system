import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { zValidator } from "@hono/zod-validator";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

/* Config */
import { env } from "@config/env.js";
import { SESSION_MAX_AGE_SECONDS, SESSION_COOKIE_NAME } from "@config/auth.js";

/* Logging */
import { logger as appLogger } from "@infrastructure/logging/logger.js";

/* Zod Schemas */
import { LoginRequestSchema } from "@ticket-system/shared/dto/auth";

/* Use Cases */
import { loginUser, logoutUser } from "@infrastructure/composition.js";

/* Mappers */
import { toLoginUserResponseDto } from "@infrastructure/mappers/user-mapper.js";

/* Errors */
import { InvalidCredentialsError } from "@application/errors/auth-errors.js";

export const app = new Hono();

app.use(secureHeaders());

app.use("*", async (c, next) => {
  const startedAt = Date.now();

  await next();

  appLogger.info("HTTP request completed", {
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    durationMs: Date.now() - startedAt,
  });
});

app.get("/health", (c) => {
  appLogger.debug("Health check requested.", {
    method: c.req.method,
    path: c.req.path,
  });

  return c.json({ status: "ok" }, 200);
});

app.post("/auth/login", zValidator("json", LoginRequestSchema), async (c) => {
  appLogger.info("Login attempt received", {
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

  appLogger.info("Login succeeded", {
    userId: result.user.id,
    path: c.req.path,
  });

  return c.json({ user: toLoginUserResponseDto(result.user) }, 200);
});

app.post("/auth/logout", async (c) => {
  const sessionToken = getCookie(c, SESSION_COOKIE_NAME);

  await logoutUser({ sessionToken });

  deleteCookie(c, SESSION_COOKIE_NAME, {
    path: "/",
    secure: env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  return c.body(null, 204);
});

app.onError((err, c) => {
  if (err instanceof InvalidCredentialsError) {
    appLogger.warn("Login failed due to invalid credentials", {
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

  appLogger.error(
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
