import type { Session } from "@application/models/session.js";

export interface CreateSessionInput {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
}

export interface SessionRepository {
  create(input: CreateSessionInput): Promise<Session>;

  findByTokenHash(tokenHash: string): Promise<Session | null>;

  deleteByTokenHash(tokenHash: string): Promise<void>;
}
