import { argon2PasswordHasher } from "@infrastructure/password-hasher/argon2-password-hasher.js";
import { logger } from "@infrastructure/logging/logger.js";

import { buildLoginUser } from "@application/services/build-login-user.js";
import { buildLogoutUser } from "@application/services/build-logout-user.js";
import { buildAuthenticateSession } from "@application/services/build-authenticate-session.js";
import { buildCreateTicket } from "@application/services/build-create-ticket.js";
import { buildListTickets } from "@application/services/build-list-tickets.js";
import { buildUpdateTicket } from "@application/services/build-update-ticket.js";

import { prismaUserRepository } from "@infrastructure/db/repositories/prisma-user-repository.js";
import { prismaSessionRepository } from "@infrastructure/db/repositories/prisma-session-repository.js";
import { prismaTicketRepository } from "@infrastructure/db/repositories/prisma-ticket-repository.js";
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

export const authenticateSession = buildAuthenticateSession(
  prismaSessionRepository,
  prismaUserRepository,
  logger,
  sha256SessionTokenHasher,
);

export const createTicket = buildCreateTicket(prismaTicketRepository, logger);
export const listTickets = buildListTickets(prismaTicketRepository, logger);
export const updateTicket = buildUpdateTicket(prismaTicketRepository, logger);
