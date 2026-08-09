import { describe, expect, it, vi } from "vitest";

import { buildLoginUser } from "@application/services/build-login-user.js";
import type { Logger } from "@application/interfaces/logger.js";
import type { PasswordHasher } from "@application/interfaces/password-hasher.js";
import type { SessionRepository } from "@application/interfaces/session-repository.js";
import type { SessionTokenHasher } from "@application/interfaces/session-token-hasher.js";
import type { UserRepository } from "@application/interfaces/user-repository.js";
import type { Session } from "@application/models/session.js";
import type { User } from "@application/models/user.js";

describe("buildLoginUser", () => {
  it("authenticates a user and creates a session", async () => {
    const user: User = {
      id: "user-1",
      name: "Alice",
      email: "alice@example.com",
      passwordHash: "hashed-password",
      role: "USER",
      deletedAt: null,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };

    const userRepository: UserRepository = {
      findByEmail: vi
        .fn<(email: string) => Promise<User | null>>()
        .mockResolvedValue(user),
      findById: vi
        .fn<(id: string) => Promise<User | null>>()
        .mockResolvedValue(null),
      findAllActive: vi.fn<() => Promise<User[]>>().mockResolvedValue([user]),
    };

    const sessionRepository: SessionRepository = {
      create: vi
        .fn<
          (input: {
            tokenHash: string;
            userId: string;
            expiresAt: Date;
          }) => Promise<Session>
        >()
        .mockImplementation(async (input) => ({
          id: "session-1",
          tokenHash: input.tokenHash,
          userId: input.userId,
          expiresAt: input.expiresAt,
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
        })),
      findByTokenHash: vi
        .fn<(tokenHash: string) => Promise<Session | null>>()
        .mockResolvedValue(null),
      deleteByTokenHash: vi
        .fn<(tokenHash: string) => Promise<void>>()
        .mockResolvedValue(),
    };

    const passwordHasher: PasswordHasher = {
      hash: vi
        .fn<(password: string) => Promise<string>>()
        .mockResolvedValue("unused"),
      verify: vi
        .fn<(password: string, passwordHash: string) => Promise<boolean>>()
        .mockResolvedValue(true),
    };

    const logger: Logger = {
      trace: vi.fn<(message: string, meta?: Record<string, unknown>) => void>(),
      debug: vi.fn<(message: string, meta?: Record<string, unknown>) => void>(),
      info: vi.fn<(message: string, meta?: Record<string, unknown>) => void>(),
      warn: vi.fn<(message: string, meta?: Record<string, unknown>) => void>(),
      error:
        vi.fn<
          (
            message: string,
            meta?: Record<string, unknown>,
            err?: unknown,
          ) => void
        >(),
    };

    const sessionTokenHasher: SessionTokenHasher = {
      hash: vi.fn<(sessionToken: string) => string>(
        (sessionToken) => sessionToken,
      ),
    };

    const loginUser = buildLoginUser(
      userRepository,
      sessionRepository,
      passwordHasher,
      logger,
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
    expect(sessionRepository.create).toHaveBeenCalledTimes(1);

    const createInput = vi.mocked(sessionRepository.create).mock.calls[0][0];
    expect(createInput.userId).toBe(user.id);
    expect(createInput.tokenHash).toHaveLength(64);
    expect(createInput.expiresAt).toBeInstanceOf(Date);
  });
});
