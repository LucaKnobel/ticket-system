import type { Session } from "@application/models/session.js";

/**
 * Input for creating a new session record.
 */
export interface CreateSessionInput {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
}

/**
 * Persistence interface for session data.
 */
export interface SessionRepository {
  create(input: CreateSessionInput): Promise<Session>;

  findByTokenHash(tokenHash: string): Promise<Session | null>;

  deleteByTokenHash(tokenHash: string): Promise<void>;
}
