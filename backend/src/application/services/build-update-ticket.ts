import {
  TicketForbiddenError,
  TicketNotFoundError,
} from "@application/errors/ticket-errors.js";
import type { Logger } from "@application/interfaces/logger.js";
import type {
  TicketRepository,
  UpdateTicketInput,
} from "@application/interfaces/ticket-repository.js";
import type { TicketWithUsers } from "@application/models/ticket.js";
import type { AuthenticatedUser } from "@infrastructure/http/types.js";

/**
 * Builds a use case for updating an existing support ticket.
 */
export const buildUpdateTicket = (
  ticketRepository: TicketRepository,
  logger: Logger,
) => {
  return async (
    id: string,
    input: UpdateTicketInput,
    currentUser: AuthenticatedUser,
  ): Promise<TicketWithUsers> => {
    logger.info("Updating ticket", {
      ticketId: id,
      userId: currentUser.id,
      input,
    });

    const existingTicket = await ticketRepository.findById(id);

    if (!existingTicket) {
      throw new TicketNotFoundError();
    }

    if (
      currentUser.role !== "ADMIN" &&
      existingTicket.createdById !== currentUser.id
    ) {
      throw new TicketForbiddenError();
    }

    await ticketRepository.update(id, input);

    const updatedTicket = await ticketRepository.findByIdWithUsers(id);

    if (!updatedTicket) {
      throw new TicketNotFoundError();
    }

    logger.info("Ticket updated", {
      ticketId: updatedTicket.id,
    });

    return updatedTicket;
  };
};
