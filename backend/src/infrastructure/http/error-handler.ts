import type { Context } from "hono";

import { InvalidCredentialsError } from "@application/errors/auth-errors.js";
import { ApplicationError } from "@application/errors/application-error.js";
import {
  TicketForbiddenError,
  TicketNotFoundError,
} from "@application/errors/ticket-errors.js";
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

  if (err instanceof TicketNotFoundError) {
    logger.warn("Ticket not found", {
      method: c.req.method,
      path: c.req.path,
    });

    return c.json(
      {
        message: err.message,
      },
      404,
    );
  }

  if (err instanceof TicketForbiddenError) {
    logger.warn("Ticket update forbidden", {
      method: c.req.method,
      path: c.req.path,
    });

    return c.json(
      {
        message: err.message,
      },
      403,
    );
  }

  if (err instanceof ApplicationError) {
    logger.warn("Application error", {
      method: c.req.method,
      path: c.req.path,
      errorName: err.name,
    });

    return c.json(
      {
        message: err.message,
      },
      422,
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
