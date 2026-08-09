import { afterEach, describe, expect, it, vi } from "vitest";

import { InvalidCredentialsError } from "@application/errors/auth-errors.js";
import type { SessionTokenHasher } from "@application/interfaces/session-token-hasher.js";
import { buildLoginUser } from "@application/services/build-login-user.js";
import { SESSION_DURATION_MS } from "@config/auth.js";
import {
  createLogger,
  createPasswordHasherMock,
  createSessionRepositoryMock,
  createUser,
  createUserRepositoryMock,
} from "./test-helpers.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("buildLoginUser", () => {
  it("returns user, generates a session token, and creates a session with expected expiry", async () => {
    const user = createUser();
    const now = Date.parse("2026-01-01T12:00:00.000Z");
    vi.spyOn(Date, "now").mockReturnValue(now);

    const userRepository = createUserRepositoryMock(user);
    const sessionRepository = createSessionRepositoryMock();
    const passwordHasher = createPasswordHasherMock(true);

    const sessionTokenHasher: SessionTokenHasher = {
      hash: vi.fn((sessionToken: string) => `hashed:${sessionToken}`),
    };

    const loginUser = buildLoginUser(
      userRepository,
      sessionRepository,
      passwordHasher,
      createLogger(),
      sessionTokenHasher,
    );

    const result = await loginUser({
      email: user.email,
      password: "plain-password",
    });

    expect(result.user).toEqual(user);
    expect(result.sessionToken).toHaveLength(64);
    expect(passwordHasher.verify).toHaveBeenCalledWith(
      "plain-password",
      user.passwordHash,
    );
    expect(sessionTokenHasher.hash).toHaveBeenCalledWith(result.sessionToken);
    expect(sessionRepository.create).toHaveBeenCalledWith({
      tokenHash: `hashed:${result.sessionToken}`,
      userId: user.id,
      expiresAt: new Date(now + SESSION_DURATION_MS),
    });
  });

  it("throws InvalidCredentialsError for unknown email and does not verify password", async () => {
    const userRepository = createUserRepositoryMock(null);
    const sessionRepository = createSessionRepositoryMock();
    const passwordHasher = createPasswordHasherMock(true);

    const loginUser = buildLoginUser(
      userRepository,
      sessionRepository,
      passwordHasher,
      createLogger(),
      { hash: vi.fn((sessionToken: string) => `hashed:${sessionToken}`) },
    );

    await expect(
      loginUser({
        email: "missing@example.com",
        password: "plain-password",
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);

    expect(passwordHasher.verify).not.toHaveBeenCalled();
    expect(sessionRepository.create).not.toHaveBeenCalled();
  });

  it("throws InvalidCredentialsError for wrong password and does not create session", async () => {
    const user = createUser();

    const userRepository = createUserRepositoryMock(user);
    const sessionRepository = createSessionRepositoryMock();
    const passwordHasher = createPasswordHasherMock(false);

    const loginUser = buildLoginUser(
      userRepository,
      sessionRepository,
      passwordHasher,
      createLogger(),
      { hash: vi.fn((sessionToken: string) => `hashed:${sessionToken}`) },
    );

    await expect(
      loginUser({
        email: user.email,
        password: "wrong-password",
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);

    expect(passwordHasher.verify).toHaveBeenCalledWith(
      "wrong-password",
      user.passwordHash,
    );
    expect(sessionRepository.create).not.toHaveBeenCalled();
  });
});
