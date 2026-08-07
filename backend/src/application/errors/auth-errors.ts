import { ApplicationError } from "@application/errors/application-error.js";

/**
 * Raised when the provided credentials are incorrect.
 */
export class InvalidCredentialsError extends ApplicationError {
  constructor() {
    super("Invalid credentials.");
    this.name = "InvalidCredentialsError";
  }
}
