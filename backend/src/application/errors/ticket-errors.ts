import { ApplicationError } from "@application/errors/application-error.js";

export class TicketNotFoundError extends ApplicationError {
  constructor() {
    super("Ticket not found.");
  }
}

export class TicketForbiddenError extends ApplicationError {
  constructor() {
    super("You are not allowed to update this ticket.");
  }
}
