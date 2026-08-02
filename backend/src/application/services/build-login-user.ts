import type { UserRepository } from "@application/interfaces/user-repository.js";
import type { SessionRepository } from "@application/interfaces/session-repository.js";
import type { PasswordHasher } from "@application/interfaces/password-hasher.js";
import type { User } from "@application/models/user.js";
import crypto from "crypto";
import { InvalidCredentialsError } from "@application/errors/auth-errors.js";

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
 * Session lifetime in milliseconds.
 */
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * Builds a login use case that authenticates a user, creates a session,
 * and returns a raw session token together with the authenticated user.
 */
export const buildLoginUser = (
  userRepository: UserRepository,
  sessionRepository: SessionRepository,
  passwordHasher: PasswordHasher,
) => {
  return async (input: LoginUserInput): Promise<LoginUserOutput> => {
    const user = await userRepository.findByEmail(input.email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await passwordHasher.verify(
      input.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");

    const hash = crypto.createHash("sha256");
    hash.update(sessionToken);
    const sessionTokenHash = hash.digest("hex");

    await sessionRepository.create({
      tokenHash: sessionTokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + SESSION_DURATION_MS), // 1 day expiration
    });

    return {
      sessionToken,
      user,
    };
  };
};
