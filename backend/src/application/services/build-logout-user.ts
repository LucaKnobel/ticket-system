import type { Logger } from "@application/interfaces/logger.js";
import type { SessionRepository } from "@application/interfaces/session-repository.js";
import type { SessionTokenHasher } from "@application/interfaces/session-token-hasher.js";

export type LogoutUserInput = {
  sessionToken?: string;
};

export const buildLogoutUser = (
  sessionRepository: SessionRepository,
  logger: Logger,
  sessionTokenHasher: SessionTokenHasher,
) => {
  return async (input: LogoutUserInput): Promise<void> => {
    if (!input.sessionToken) {
      logger.info("Logout requested without active session");
      return;
    }

    const sessionTokenHash = sessionTokenHasher.hash(input.sessionToken);

    await sessionRepository.deleteByTokenHash(sessionTokenHash);

    logger.info("Logout completed");
  };
};
