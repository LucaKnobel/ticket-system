import { vi } from "vitest";

import type { Logger } from "@application/interfaces/logger.js";
import type { PasswordHasher } from "@application/interfaces/password-hasher.js";
import type {
  CreateSessionInput,
  SessionRepository,
} from "@application/interfaces/session-repository.js";
import type {
  CreateTicketInput,
  TicketRepository,
  UpdateTicketInput,
} from "@application/interfaces/ticket-repository.js";
import type { UserRepository } from "@application/interfaces/user-repository.js";
import type { Session } from "@application/models/session.js";
import type { Ticket, TicketWithUsers } from "@application/models/ticket.js";
import type { User } from "@application/models/user.js";
import type { AuthenticatedUser } from "@infrastructure/http/types.js";

/**
 * Creates a logger stub with no-op methods.
 */
export const createLogger = (): Logger => ({
  trace: vi.fn(() => undefined),
  debug: vi.fn(() => undefined),
  info: vi.fn(() => undefined),
  warn: vi.fn(() => undefined),
  error: vi.fn(() => undefined),
});

/**
 * Creates a persisted user fixture for backend unit tests.
 */
export const createUser = (overrides?: Partial<User>): User => ({
  id: "user-1",
  name: "Alice",
  email: "alice@example.com",
  passwordHash: "hashed-password",
  role: "USER",
  deletedAt: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  ...overrides,
});

/**
 * Creates an administrator user fixture for backend unit tests.
 */
export const createAdminUser = (): User => ({
  id: "admin-1",
  name: "Administrator",
  email: "admin@example.com",
  passwordHash: "hashed-password",
  role: "ADMIN",
  deletedAt: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
});

/**
 * Creates an authenticated user payload used by HTTP-layer tests.
 */
export const createAuthenticatedUser = (
  overrides?: Partial<AuthenticatedUser>,
): AuthenticatedUser => ({
  id: "user-1",
  name: "Alice",
  email: "alice@example.com",
  role: "USER",
  ...overrides,
});

/**
 * Creates an administrator authenticated user payload used by HTTP-layer tests.
 */
export const createAdminAuthenticatedUser = (): AuthenticatedUser => ({
  id: "admin-1",
  name: "Administrator",
  email: "admin@example.com",
  role: "ADMIN",
});

/**
 * Creates a session fixture with stable defaults.
 */
export const createSession = (overrides?: Partial<Session>): Session => ({
  id: "session-1",
  tokenHash: "session-token-hash",
  userId: "user-1",
  expiresAt: new Date("2030-01-01T00:00:00.000Z"),
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  ...overrides,
});

/**
 * Creates a session repository double for tests that need to control token lookups.
 */
export const createSessionRepository = ({
  findByTokenHashResult,
  createResult = createSession(),
}: {
  findByTokenHashResult: Session | null;
  createResult?: Session;
}): SessionRepository => ({
  create: vi.fn(
    async (_input: CreateSessionInput): Promise<Session> => createResult,
  ),
  findByTokenHash: vi.fn(
    async (_tokenHash: string): Promise<Session | null> =>
      findByTokenHashResult,
  ),
  deleteByTokenHash: vi.fn(
    async (_tokenHash: string): Promise<void> => undefined,
  ),
});

/**
 * Creates a user repository double with a configurable lookup result.
 */
export const createUserRepository = ({
  findByIdResult,
}: {
  findByIdResult: User | null;
}): UserRepository => ({
  findByEmail: vi.fn(async (_email: string): Promise<User | null> => null),
  findById: vi.fn(async (_id: string): Promise<User | null> => findByIdResult),
  findAllActive: vi.fn(async (): Promise<User[]> => []),
});

/**
 * Creates a user repository mock focused on login scenarios.
 */
export const createUserRepositoryMock = (
  findByEmailResult: User | null,
): UserRepository => ({
  findByEmail: vi.fn(
    async (_email: string): Promise<User | null> => findByEmailResult,
  ),
  findById: vi.fn(async (_id: string): Promise<User | null> => null),
  findAllActive: vi.fn(async (): Promise<User[]> => []),
});

/**
 * Creates a session repository mock focused on login scenarios.
 */
export const createSessionRepositoryMock = (): SessionRepository => ({
  create: vi.fn(async (input: CreateSessionInput): Promise<Session> => ({
    id: "session-1",
    tokenHash: input.tokenHash,
    userId: input.userId,
    expiresAt: input.expiresAt,
    createdAt: new Date(),
  })),
  findByTokenHash: vi.fn(
    async (_tokenHash: string): Promise<Session | null> => null,
  ),
  deleteByTokenHash: vi.fn(
    async (_tokenHash: string): Promise<void> => undefined,
  ),
});

/**
 * Creates a password hasher mock for login scenarios.
 */
export const createPasswordHasherMock = (
  verifyResult: boolean,
): PasswordHasher => ({
  hash: vi.fn(async (_password: string) => "unused"),
  verify: vi.fn(
    async (_password: string, _passwordHash: string) => verifyResult,
  ),
});

/**
 * Creates a ticket fixture with stable defaults.
 */
export const createTicketModel = (overrides?: Partial<Ticket>): Ticket => ({
  id: "ticket-1",
  title: "Login issue",
  description: "Cannot log in",
  status: "OPEN",
  priority: "LOW",
  createdById: "user-1",
  assignedToId: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  ...overrides,
});

/**
 * Creates a ticket view model that includes creator and assignee display names.
 */
export const createTicketWithUsers = (
  overrides?: Partial<TicketWithUsers>,
): TicketWithUsers => ({
  ...createTicketModel(),
  createdByName: "Alice",
  assignedToName: null,
  ...overrides,
});

/**
 * Creates a ticket repository double with configurable read and write results.
 */
export const createTicketRepository = ({
  findAllWithUsersResult = [],
  findByIdResult = null,
  findByIdWithUsersResult = null,
  createResult = createTicketModel(),
  updateResult = createTicketModel(),
}: {
  findAllWithUsersResult?: TicketWithUsers[];
  findByIdResult?: Ticket | null;
  findByIdWithUsersResult?: TicketWithUsers | null;
  createResult?: Ticket;
  updateResult?: Ticket;
}): TicketRepository => ({
  findAllWithUsers: vi.fn(
    async (): Promise<TicketWithUsers[]> => findAllWithUsersResult,
  ),
  findById: vi.fn(
    async (_id: string): Promise<Ticket | null> => findByIdResult,
  ),
  findByIdWithUsers: vi.fn(
    async (_id: string): Promise<TicketWithUsers | null> =>
      findByIdWithUsersResult,
  ),
  create: vi.fn(
    async (_input: CreateTicketInput): Promise<Ticket> => createResult,
  ),
  update: vi.fn(
    async (_id: string, _input: UpdateTicketInput): Promise<Ticket> =>
      updateResult,
  ),
  delete: vi.fn(async (_id: string): Promise<void> => undefined),
});
