import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { requireAuth } from "@infrastructure/http/middleware/auth-middleware.js";
import type { AppEnv } from "@infrastructure/http/types.js";
import { createTicket, listTickets } from "@infrastructure/composition.js";
import { CreateTicketRequestSchema } from "@ticket-system/shared";
import { toTicketResponseDto } from "@infrastructure/mappers/ticket-mapper.js";

/**
 * Routes for managing tickets in the application.
 */
export const ticketRoutes = new Hono<AppEnv>();

ticketRoutes.use("*", requireAuth);

ticketRoutes.get("/", async (c) => {
  const tickets = await listTickets();

  return c.json(
    tickets.map((ticket) =>
      toTicketResponseDto(
        ticket,
        ticket.createdByName,
        ticket.assignedToName,
      ),
    ),
    200,
  );
});

ticketRoutes.post(
  "/",
  zValidator("json", CreateTicketRequestSchema),
  async (c) => {
    const user = c.var.user;
    const data = c.req.valid("json");

    const ticket = await createTicket({
      title: data.title,
      description: data.description,
      priority: data.priority,
      createdById: user.id,
    });

    return c.json(
      toTicketResponseDto(ticket, user.name, null),
      201,
    );
  },
);
