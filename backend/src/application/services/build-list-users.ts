import type { Logger } from "@application/interfaces/logger.js";
import type { UserRepository } from "@application/interfaces/user-repository.js";
import type { User } from "@application/models/user.js";

/**
 * Builds a use case for listing active users for admin assignment flows.
 */
export const buildListUsers = (
  userRepository: UserRepository,
  logger: Logger,
) => {
  return async (): Promise<User[]> => {
    logger.info("Listing active users", {});

    return userRepository.findAllActive();
  };
};
