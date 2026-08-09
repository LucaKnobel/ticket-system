import type { TicketWithUsers } from "@application/models/ticket.js";
import {
  TicketResponseSchema,
  type TicketResponseDto,
} from "@ticket-system/shared";

/**
 * Maps a persisted ticket read model to a shared response DTO.
 */
export const toTicketResponseDto = (
  ticket: TicketWithUsers,
): TicketResponseDto => {
  return TicketResponseSchema.parse({
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    status: ticket.status,
    priority: ticket.priority,
    createdById: ticket.createdById,
    createdByName: ticket.createdByName,
    assignedToId: ticket.assignedToId,
    assignedToName: ticket.assignedToName,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
  });
};
