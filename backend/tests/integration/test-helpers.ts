import crypto from "node:crypto";

import argon2 from "argon2";
import type { CreateTicketRequestDto } from "@ticket-system/shared";

import { prisma } from "@infrastructure/db/prisma.js";
import { app } from "@src/app.js";
import { sha256SessionTokenHasher } from "@infrastructure/session-token-hasher/sha256-session-token-hasher.js";

export const USER_PASSWORD = "TicketSystem!2026#";
export const ADMIN_PASSWORD = "Admin!Ticket2026#";
export const TEST_RUN_ID = crypto.randomUUID();

export type SeededUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

export type LoginResult = {
  response: Response;
  setCookie: string;
  cookie: string;
};

const createdUserIds = new Set<string>();
const createdTicketIds = new Set<string>();
const createdSessionTokenHashes = new Set<string>();

const uniqueEmail = (name: string) => `${name}.${TEST_RUN_ID}@example.com`;

/**
 * Tracks a user ID for cleanup after the test run.
 */
export const trackUser = (userId: string) => {
  createdUserIds.add(userId);
};

/**
 * Tracks a ticket ID for cleanup after the test run.
 */
export const trackTicket = (ticketId: string) => {
  createdTicketIds.add(ticketId);
};

/**
 * Tracks a session token by storing its hashed value for cleanup.
 */
export const trackSession = (sessionToken: string) => {
  if (!sessionToken) {
    return;
  }

  createdSessionTokenHashes.add(sha256SessionTokenHasher.hash(sessionToken));
};

/**
 * Deletes all tracked test data created during the current run.
 */
export const cleanupCreatedData = async () => {
  if (createdTicketIds.size > 0) {
    await prisma.ticket.deleteMany({
      where: {
        id: {
          in: [...createdTicketIds],
        },
      },
    });
    createdTicketIds.clear();
  }

  if (createdSessionTokenHashes.size > 0) {
    await prisma.session.deleteMany({
      where: {
        tokenHash: {
          in: [...createdSessionTokenHashes],
        },
      },
    });
    createdSessionTokenHashes.clear();
  }

  if (createdUserIds.size > 0) {
    await prisma.user.deleteMany({
      where: {
        id: {
          in: [...createdUserIds],
        },
      },
    });
    createdUserIds.clear();
  }
};

/**
 * Creates a seeded user with a hashed password.
 */
export const createUser = async ({
  name,
  email,
  role,
  password,
}: {
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  password: string;
}): Promise<SeededUser> => {
  const passwordHash = await argon2.hash(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      role,
      passwordHash,
    },
  });

  trackUser(user.id);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

/**
 * Seeds one admin user and two normal users for integration scenarios.
 */
export const seedUsers = async () => {
  const admin = await createUser({
    name: "Administrator",
    email: uniqueEmail("admin"),
    role: "ADMIN",
    password: ADMIN_PASSWORD,
  });
  const userA = await createUser({
    name: "Alice Johnson",
    email: uniqueEmail("alice"),
    role: "USER",
    password: USER_PASSWORD,
  });
  const userB = await createUser({
    name: "Bob Miller",
    email: uniqueEmail("bob"),
    role: "USER",
    password: USER_PASSWORD,
  });

  return { admin, userA, userB };
};

/**
 * Logs in a user and captures the session cookie for follow-up requests.
 */
export const login = async (
  email: string,
  password: string,
): Promise<LoginResult> => {
  const response = await app.request("/auth/login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const setCookie = response.headers.get("set-cookie") ?? "";
  const cookie = setCookie.split(";")[0] ?? "";

  if (response.ok && cookie.startsWith("session=")) {
    trackSession(cookie.replace("session=", ""));
  }

  return { response, setCookie, cookie };
};

/**
 * Sends an authenticated request with the given cookie header.
 */
export const requestWithCookie = async (
  path: string,
  cookie: string,
  init?: RequestInit,
) => {
  const headers = new Headers(init?.headers);
  headers.set("cookie", cookie);

  return app.request(path, {
    ...init,
    headers,
  });
};

/**
 * Creates a ticket through the API using the supplied cookie.
 */
export const createTicket = async (
  cookie: string,
  input: CreateTicketRequestDto,
) => {
  return requestWithCookie("/tickets", cookie, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });
};
