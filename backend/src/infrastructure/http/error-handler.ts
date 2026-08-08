import type { Context } from "hono";

import { InvalidCredentialsError } from "@application/errors/auth-errors.js";
import { logger } from "@infrastructure/logging/logger.js";

export const errorHandler = (err: Error, c: Context) => {
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
    "Unhandled request error",
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
};
