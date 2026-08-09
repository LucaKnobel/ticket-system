import type { Ticket } from "@application/models/ticket.js";
import {
  TicketResponseSchema,
  type TicketResponseDto,
} from "@ticket-system/shared";

/**
 * Maps a persisted ticket domain model to a shared response DTO.
 */
export const toTicketResponseDto = (
  ticket: Ticket,
  createdByName: string,
  assignedToName?: string | null,
): TicketResponseDto => {
  return TicketResponseSchema.parse({
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    status: ticket.status,
    priority: ticket.priority,
    createdById: ticket.createdById,
    createdByName,
    assignedToId: ticket.assignedToId ?? null,
    assignedToName: assignedToName ?? null,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
  });
};
