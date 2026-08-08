import { argon2PasswordHasher } from "@infrastructure/password-hasher/argon2-password-hasher.js";
import { logger } from "@infrastructure/logging/logger.js";

import { buildLoginUser } from "@application/services/build-login-user.js";
import { buildLogoutUser } from "@application/services/build-logout-user.js";

import { prismaUserRepository } from "@infrastructure/db/repositories/prisma-user-repository.js";
import { prismaSessionRepository } from "@infrastructure/db/repositories/prisma-session-repository.js";
import { sha256SessionTokenHasher } from "@infrastructure/session-token-hasher/sha256-session-token-hasher.js";

export const loginUser = buildLoginUser(
  prismaUserRepository,
  prismaSessionRepository,
  argon2PasswordHasher,
  logger,
  sha256SessionTokenHasher,
);

export const logoutUser = buildLogoutUser(
  prismaSessionRepository,
  logger,
  sha256SessionTokenHasher,
);
