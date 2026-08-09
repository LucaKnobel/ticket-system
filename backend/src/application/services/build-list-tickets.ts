import type { Logger } from "@application/interfaces/logger.js";
import type { TicketRepository } from "@application/interfaces/ticket-repository.js";
import type { TicketWithUsers } from "@application/models/ticket.js";

/**
 * Builds a use case for listing tickets.
 */
export const buildListTickets = (
  ticketRepository: TicketRepository,
  logger: Logger,
) => {
  return async (): Promise<TicketWithUsers[]> => {
    logger.info("Listing tickets");

    const tickets = await ticketRepository.findAllWithUsers();

    logger.info("Tickets listed", { count: tickets.length });

    return tickets;
  };
};
