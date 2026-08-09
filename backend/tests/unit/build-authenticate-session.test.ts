import { describe, expect, it, vi } from "vitest";

import { buildAuthenticateSession } from "@application/services/build-authenticate-session.js";
import type { SessionTokenHasher } from "@application/interfaces/session-token-hasher.js";
import {
  createLogger,
  createSession,
  createSessionRepository,
  createUser,
  createUserRepository,
} from "./test-helpers.js";

const createSessionTokenHasher = (): SessionTokenHasher => ({
  hash: vi.fn((sessionToken: string) => `hashed:${sessionToken}`),
});

describe("buildAuthenticateSession", () => {
  it("returns the authenticated user for a valid session", async () => {
    const user = createUser();
    const session = createSession({
      userId: user.id,
      tokenHash: "hashed:raw-token",
    });
    const sessionRepository = createSessionRepository({
      findByTokenHashResult: session,
    });
    const userRepository = createUserRepository({ findByIdResult: user });

    const authenticateSession = buildAuthenticateSession(
      sessionRepository,
      userRepository,
      createLogger(),
      createSessionTokenHasher(),
    );

    const result = await authenticateSession("raw-token");

    expect(result).toEqual(user);
    expect(sessionRepository.findByTokenHash).toHaveBeenCalledWith(
      "hashed:raw-token",
    );
    expect(sessionRepository.deleteByTokenHash).not.toHaveBeenCalled();
  });

  it("returns null for an unknown session token", async () => {
    const sessionRepository = createSessionRepository({
      findByTokenHashResult: null,
    });
    const userRepository = createUserRepository({ findByIdResult: null });

    const authenticateSession = buildAuthenticateSession(
      sessionRepository,
      userRepository,
      createLogger(),
      createSessionTokenHasher(),
    );

    const result = await authenticateSession("missing-token");

    expect(result).toBeNull();
    expect(sessionRepository.deleteByTokenHash).not.toHaveBeenCalled();
  });

  it("returns null for an expired session and deletes it", async () => {
    const session = createSession({
      expiresAt: new Date("2000-01-01T00:00:00.000Z"),
    });
    const sessionRepository = createSessionRepository({
      findByTokenHashResult: session,
    });
    const userRepository = createUserRepository({ findByIdResult: null });

    const authenticateSession = buildAuthenticateSession(
      sessionRepository,
      userRepository,
      createLogger(),
      createSessionTokenHasher(),
    );

    const result = await authenticateSession("expired-token");

    expect(result).toBeNull();
    expect(sessionRepository.deleteByTokenHash).toHaveBeenCalledWith(
      session.tokenHash,
    );
    expect(userRepository.findById).not.toHaveBeenCalled();
  });

  it("returns null for a missing user and deletes the session", async () => {
    const session = createSession();
    const sessionRepository = createSessionRepository({
      findByTokenHashResult: session,
    });
    const userRepository = createUserRepository({ findByIdResult: null });

    const authenticateSession = buildAuthenticateSession(
      sessionRepository,
      userRepository,
      createLogger(),
      createSessionTokenHasher(),
    );

    const result = await authenticateSession("token-for-missing-user");

    expect(result).toBeNull();
    expect(sessionRepository.deleteByTokenHash).toHaveBeenCalledWith(
      session.tokenHash,
    );
  });

  it("returns null for a soft-deleted user and deletes the session", async () => {
    const user = createUser({
      deletedAt: new Date("2000-01-01T00:00:00.000Z"),
    });
    const session = createSession({ userId: user.id });
    const sessionRepository = createSessionRepository({
      findByTokenHashResult: session,
    });
    const userRepository = createUserRepository({ findByIdResult: user });

    const authenticateSession = buildAuthenticateSession(
      sessionRepository,
      userRepository,
      createLogger(),
      createSessionTokenHasher(),
    );

    const result = await authenticateSession("deleted-user-token");

    expect(result).toBeNull();
    expect(sessionRepository.deleteByTokenHash).toHaveBeenCalledWith(
      session.tokenHash,
    );
  });
});
