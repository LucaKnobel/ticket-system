import { argon2PasswordHasher } from "@infrastructure/password-hasher/argon2-password-hasher.js";
import { logger } from "@infrastructure/logging/logger.js";

import { buildLoginUser } from "@application/services/build-login-user.js";

import { prismaUserRepository } from "@infrastructure/db/repositories/prisma-user-repository.js";
import { prismaSessionRepository } from "@infrastructure/db/repositories/prisma-session-repository.js";

export const loginUser = buildLoginUser(
  prismaUserRepository,
  prismaSessionRepository,
  argon2PasswordHasher,
  logger,
);
