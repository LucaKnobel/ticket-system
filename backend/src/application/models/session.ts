import type { User } from "./user.js";

/**
 * Represents a persisted authentication session for a user.
 */
export type Session = {
  id: string;
  tokenHash: string;
  userId: string;
  user?: User;
  expiresAt: Date;
  createdAt: Date;
};
