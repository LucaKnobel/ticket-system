import {
  TicketForbiddenError,
  TicketNotFoundError,
} from "@application/errors/ticket-errors.js";
import type { Logger } from "@application/interfaces/logger.js";
import type { TicketRepository } from "@application/interfaces/ticket-repository.js";
import type { AuthenticatedUser } from "@infrastructure/http/types.js";

/**
 * Builds a use case for deleting an existing support ticket.
 */
export const buildDeleteTicket = (
  ticketRepository: TicketRepository,
  logger: Logger,
) => {
  return async (id: string, currentUser: AuthenticatedUser): Promise<void> => {
    logger.info("Deleting ticket", {
      ticketId: id,
      userId: currentUser.id,
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

    await ticketRepository.delete(id);

    logger.info("Ticket deleted", {
      ticketId: id,
    });
  };
};
