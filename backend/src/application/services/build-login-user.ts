import type { UserRepository } from "@application/interfaces/user-repository.js";
import type { SessionRepository } from "@application/interfaces/session-repository.js";
import type { PasswordHasher } from "@application/interfaces/password-hasher.js";
import type { Logger } from "@application/interfaces/logger.js";
import type { SessionTokenHasher } from "@application/interfaces/session-token-hasher.js";
import type { User } from "@application/models/user.js";
import crypto from "crypto";
import { InvalidCredentialsError } from "@application/errors/auth-errors.js";
import { SESSION_DURATION_MS } from "@config/auth.js";
/**
 * Input for the login use case.
 */
export type LoginUserInput = {
  /** User email address used for authentication. */
  email: string;

  /** Plain-text password supplied by the user. */
  password: string;
};

/**
 * Result returned by the login use case.
 */
type LoginUserOutput = {
  /** Raw session token that should be returned to the client. */
  sessionToken: string;

  /** Authenticated user that matched the supplied credentials. */
  user: User;
};

/**
 * Builds a login use case that authenticates a user, creates a session,
 * and returns a raw session token together with the authenticated user.
 */
export const buildLoginUser = (
  userRepository: UserRepository,
  sessionRepository: SessionRepository,
  passwordHasher: PasswordHasher,
  logger: Logger,
  sessionTokenHasher: SessionTokenHasher,
) => {
  return async (input: LoginUserInput): Promise<LoginUserOutput> => {
    logger.info("Login attempt started", { email: input.email });

    const user = await userRepository.findByEmail(input.email);

    if (!user) {
      logger.warn("Login attempt failed: user not found", {
        email: input.email,
      });
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await passwordHasher.verify(
      input.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      logger.warn("Login attempt failed: invalid password", {
        userId: user.id,
      });
      throw new InvalidCredentialsError();
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");

    const sessionTokenHash = sessionTokenHasher.hash(sessionToken);

    await sessionRepository.create({
      tokenHash: sessionTokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
    });

    logger.info("Login succeeded", { userId: user.id });

    return {
      sessionToken,
      user,
    };
  };
};
