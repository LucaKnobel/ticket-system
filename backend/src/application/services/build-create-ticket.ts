import type { Logger } from "@application/interfaces/logger.js";
import type {
  CreateTicketInput,
  TicketRepository,
} from "@application/interfaces/ticket-repository.js";
import type { Ticket } from "@application/models/ticket.js";

/**
 * Builds a use case for creating a new support ticket.
 */
export const buildCreateTicket = (
  ticketRepository: TicketRepository,
  logger: Logger,
) => {
  return async (input: CreateTicketInput): Promise<Ticket> => {
    logger.info("Creating ticket", {
      title: input.title,
      createdById: input.createdById,
    });

    const ticket = await ticketRepository.create(input);

    logger.info("Ticket created", {
      ticketId: ticket.id,
      createdById: ticket.createdById,
    });

    return ticket;
  };
};
