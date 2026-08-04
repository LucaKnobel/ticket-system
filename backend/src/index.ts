import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { zValidator } from "@hono/zod-validator";
import { setCookie } from "hono/cookie";

/* Config */
import { env } from "@config/env.js";
import { SESSION_MAX_AGE_SECONDS, SESSION_COOKIE_NAME } from "@config/auth.js";

/* Zod Schemas */
import { LoginRequestSchema } from "@ticket-system/shared/dto/auth";

/* Use Cases */
import { loginUser } from "@infrastructure/composition.js";

/* Mappers */
import { toLoginUserResponseDto } from "@infrastructure/mappers/user-mapper.js";

/* Errors */
import { InvalidCredentialsError } from "@application/errors/auth-errors.js";

const app = new Hono();

app.use(logger());
app.use(secureHeaders());

app.post(
  "/api/auth/login",
  zValidator("json", LoginRequestSchema),
  async (c) => {
    const data = c.req.valid("json");
    const result = await loginUser(data);
    setCookie(c, SESSION_COOKIE_NAME, result.sessionToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return c.json({ user: toLoginUserResponseDto(result.user) }, 200);
  },
);

app.onError((err, c) => {
  if (err instanceof InvalidCredentialsError) {
    return c.json(
      {
        message: "Invalid email or password.",
      },
      401,
    );
  }

  console.error(err);

  return c.json(
    {
      message: "Internal server error.",
    },
    500,
  );
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
