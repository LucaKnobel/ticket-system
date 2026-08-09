import { TicketNotFoundError } from "@application/errors/ticket-errors.js";
import type { Logger } from "@application/interfaces/logger.js";
import type { TicketRepository } from "@application/interfaces/ticket-repository.js";
import type { TicketWithUsers } from "@application/models/ticket.js";
import type { AuthenticatedUser } from "@infrastructure/http/types.js";

/**
 * Builds a use case for reading a single ticket by id.
 */
export const buildGetTicket = (
  ticketRepository: TicketRepository,
  logger: Logger,
) => {
  return async (
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<TicketWithUsers> => {
    logger.info("Fetching ticket", {
      ticketId: id,
      userId: currentUser.id,
    });

    const ticket = await ticketRepository.findByIdWithUsers(id);

    if (!ticket) {
      throw new TicketNotFoundError();
    }

    logger.info("Ticket fetched", {
      ticketId: ticket.id,
    });

    return ticket;
  };
};
