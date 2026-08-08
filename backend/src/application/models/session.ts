/**
 * Represents a persisted authentication session in the application.
 */
export type Session = {
  id: string;
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
};
