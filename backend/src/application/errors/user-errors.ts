import { ApplicationError } from "@application/errors/application-error.js";

/**
 * Raised when a user cannot be found.
 */
export class UserNotFoundError extends ApplicationError {
  constructor() {
    super("User not found.");
    this.name = "UserNotFoundError";
  }
}
