import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { requireAuth } from "@infrastructure/http/middleware/auth-middleware.js";
import type { AppEnv } from "@infrastructure/http/types.js";
import {
  createTicket,
  deleteTicket,
  getTicket,
  listTickets,
  updateTicket,
} from "@infrastructure/composition.js";
import {
  CreateTicketRequestSchema,
  UpdateTicketParamSchema,
  UpdateTicketRequestSchema,
  GetTicketParamSchema,
} from "@ticket-system/shared";
import { toTicketResponseDto } from "@infrastructure/mappers/ticket-mapper.js";

/**
 * Ticket routes for create, read, update, and delete flows.
 */
export const ticketRoutes = new Hono<AppEnv>();

ticketRoutes.use("*", requireAuth);

ticketRoutes.get("/", async (c) => {
  const tickets = await listTickets();

  return c.json(tickets.map(toTicketResponseDto), 200);
});

ticketRoutes.get(
  "/:id",
  zValidator("param", GetTicketParamSchema),
  async (c) => {
    const user = c.var.user;
    const { id } = c.req.valid("param");
    const ticket = await getTicket(id, user);

    return c.json(toTicketResponseDto(ticket), 200);
  },
);

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
      toTicketResponseDto({
        ...ticket,
        createdByName: user.name,
        assignedToName: null,
      }),
      201,
    );
  },
);

ticketRoutes.put(
  "/:id",
  zValidator("param", UpdateTicketParamSchema),
  zValidator("json", UpdateTicketRequestSchema),
  async (c) => {
    const user = c.var.user;
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");

    const ticket = await updateTicket(
      id,
      {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assignedToId: data.assignedToId,
      },
      user,
    );

    return c.json(toTicketResponseDto(ticket), 200);
  },
);

ticketRoutes.delete(
  "/:id",
  zValidator("param", UpdateTicketParamSchema),
  async (c) => {
    const user = c.var.user;
    const { id } = c.req.valid("param");

    await deleteTicket(id, user);

    return c.body(null, 204);
  },
);
