import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { zValidator } from "@hono/zod-validator";
import { setCookie } from "hono/cookie";

/* Use Cases */
import { loginUser } from "@infrastructure/composition.js";

/* Zod Schemas */
import { LoginUserBodySchema } from "@infrastructure/validation/user-schemas.js";

/* Mappers */
import { toLoginUserResponseDto } from "@infrastructure/mappers/user-mapper.js";

/* Config */
import { SESSION_MAX_AGE_SECONDS, SESSION_COOKIE_NAME } from "@config/auth.js";
import { env } from "@config/env.js";

const app = new Hono();

app.use(logger());
app.use(secureHeaders());

app.post(
  "/api/auth/login",
  zValidator("json", LoginUserBodySchema),
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

// to do
// 404
// error handling middleware

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
