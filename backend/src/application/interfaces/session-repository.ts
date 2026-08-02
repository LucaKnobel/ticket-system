import type { Session } from "../models/session.js";

export interface SessionRepository {
  create(session: Session): Promise<Session>;

  findByTokenHash(tokenHash: string): Promise<Session | null>;

  deleteByTokenHash(tokenHash: string): Promise<void>;
}
