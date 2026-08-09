import type { Ticket } from "@application/models/ticket.js";
import {
  TicketResponseSchema,
  type TicketResponseDto,
  type TicketUserSummaryDto,
} from "@ticket-system/shared";

/**
 * Maps a persisted ticket domain model to a shared response DTO.
 */
export const toTicketResponseDto = (
  ticket: Ticket,
  createdByUser: TicketUserSummaryDto,
  assignedToUser?: TicketUserSummaryDto | null,
): TicketResponseDto => {
  return TicketResponseSchema.parse({
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    status: ticket.status,
    priority: ticket.priority,
    createdBy: {
      id: ticket.createdById,
      name: createdByUser.name,
    },
    assignedTo:
      ticket.assignedToId && assignedToUser
        ? {
            id: assignedToUser.id,
            name: assignedToUser.name,
          }
        : null,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
  });
};
