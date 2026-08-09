import type { SessionRepository } from "@application/interfaces/session-repository.js";
import type { UserRepository } from "@application/interfaces/user-repository.js";
import type { Logger } from "@application/interfaces/logger.js";
import type { SessionTokenHasher } from "@application/interfaces/session-token-hasher.js";
import type { User } from "@application/models/user.js";

/**
 * Builds a session authenticator that validates a session token and resolves the associated user.
 */
export const buildAuthenticateSession = (
  sessionRepository: SessionRepository,
  userRepository: UserRepository,
  logger: Logger,
  sessionTokenHasher: SessionTokenHasher,
) => {
  return async (sessionToken: string): Promise<User | null> => {
    const sessionTokenHash = sessionTokenHasher.hash(sessionToken);
    const session = await sessionRepository.findByTokenHash(sessionTokenHash);

    if (!session) {
      logger.warn("Session authentication failed: session not found");
      return null;
    }

    if (session.expiresAt < new Date()) {
      logger.warn("Session authentication failed: session expired", {
        sessionId: session.id,
      });
      await sessionRepository.deleteByTokenHash(session.tokenHash);
      return null;
    }

    const user = await userRepository.findById(session.userId);

    if (!user) {
      logger.warn("Session authentication failed: user not found", {
        userId: session.userId,
      });
      await sessionRepository.deleteByTokenHash(session.tokenHash);
      return null;
    }

    if (user.deletedAt) {
      logger.warn("Session authentication failed: user deleted", {
        userId: user.id,
      });
      await sessionRepository.deleteByTokenHash(session.tokenHash);
      return null;
    }

    logger.info("Session authentication succeeded", {
      userId: user.id,
      sessionId: session.id,
    });

    return user;
  };
};
