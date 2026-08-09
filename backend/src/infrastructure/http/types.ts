import type { UserRole } from "@application/models/user.js";

/**
 * Represents the authenticated user available in the HTTP request context.
 */
export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

/**
 * Defines application-specific values available in the Hono context.
 */
/**
 * Application environment bindings for the Hono context.
 */
export type AppEnv = {
  Variables: {
    user: AuthenticatedUser;
  };
};
