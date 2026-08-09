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
    createdBy: {
      id: ticket.createdById,
      name: ticket.createdByName,
    },
    assignedTo:
      ticket.assignedToId && ticket.assignedToName
        ? {
            id: ticket.assignedToId,
            name: ticket.assignedToName,
          }
        : null,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
  });
};
