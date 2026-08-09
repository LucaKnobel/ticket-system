import crypto from "node:crypto";

import { afterAll, afterEach, describe, expect, it } from "vitest";

import { prisma } from "@infrastructure/db/prisma.js";
import { app } from "@src/app.js";
import { sha256SessionTokenHasher } from "@infrastructure/session-token-hasher/sha256-session-token-hasher.js";
import {
  LoginResponseSchema,
  TicketResponseSchema,
  UserSummaryResponseSchema,
} from "@ticket-system/shared";
import {
  ADMIN_PASSWORD,
  createTicket,
  USER_PASSWORD,
  cleanupCreatedData,
  login,
  requestWithCookie,
  seedUsers,
  trackSession,
  trackTicket,
} from "./test-helpers.js";

afterEach(async () => {
  await cleanupCreatedData();
});

afterAll(async () => {
  await cleanupCreatedData();
  await prisma.$disconnect();
});

describe("backend integration flows", () => {
  it("rejects invalid login payloads and wrong credentials", async () => {
    const { userA } = await seedUsers();

    const invalidPayloadResponse = await app.request("/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: "not-an-email",
        password: "",
      }),
    });

    expect(invalidPayloadResponse.status).toBe(400);

    const wrongCredentials = await login(userA.email, "wrong-password");

    expect(wrongCredentials.response.status).toBe(401);
    expect(await prisma.session.count()).toBe(0);
  });

  it("runs the auth lifecycle end to end and persists the session", async () => {
    const { userA } = await seedUsers();

    const loginResult = await login(userA.email, USER_PASSWORD);

    expect(loginResult.response.status).toBe(200);
    const loginBody = LoginResponseSchema.parse(
      await loginResult.response.json(),
    );
    expect(loginBody).toEqual({
      id: userA.id,
      name: userA.name,
      email: userA.email,
      role: userA.role,
    });
    expect(loginResult.cookie).toContain("session=");
    expect(loginResult.setCookie).toContain("HttpOnly");

    const sessionToken = loginResult.cookie.replace("session=", "");
    const sessionTokenHash = sha256SessionTokenHasher.hash(sessionToken);

    const storedSession = await prisma.session.findUnique({
      where: {
        tokenHash: sessionTokenHash,
      },
    });

    expect(storedSession).not.toBeNull();
    expect(storedSession?.userId).toBe(userA.id);

    const sessionResponse = await requestWithCookie(
      "/auth/session",
      loginResult.cookie,
    );

    expect(sessionResponse.status).toBe(200);
    expect(LoginResponseSchema.parse(await sessionResponse.json())).toEqual(
      loginBody,
    );

    const logoutResponse = await requestWithCookie(
      "/auth/logout",
      loginResult.cookie,
      {
        method: "POST",
      },
    );

    expect(logoutResponse.status).toBe(204);
    expect(
      await prisma.session.findUnique({
        where: {
          tokenHash: sessionTokenHash,
        },
      }),
    ).toBeNull();

    const postLogoutSessionResponse = await requestWithCookie(
      "/auth/session",
      loginResult.cookie,
    );

    expect(postLogoutSessionResponse.status).toBe(401);
  });

  it("rejects missing, invalid, and expired sessions with 401", async () => {
    const { userA } = await seedUsers();

    const missingCookieResponse = await app.request("/auth/session");
    expect(missingCookieResponse.status).toBe(401);

    const invalidCookieResponse = await requestWithCookie(
      "/auth/session",
      "session=invalid-token",
    );
    expect(invalidCookieResponse.status).toBe(401);

    const expiredRawToken = crypto.randomUUID();
    await prisma.session.create({
      data: {
        tokenHash: sha256SessionTokenHasher.hash(expiredRawToken),
        userId: userA.id,
        expiresAt: new Date(Date.now() - 60_000),
      },
    });
    trackSession(expiredRawToken);

    const expiredResponse = await requestWithCookie(
      "/auth/session",
      `session=${expiredRawToken}`,
    );

    expect(expiredResponse.status).toBe(401);
    expect(
      await prisma.session.findUnique({
        where: {
          tokenHash: sha256SessionTokenHasher.hash(expiredRawToken),
        },
      }),
    ).toBeNull();
  });

  it("protects the admin users endpoint with auth and role checks", async () => {
    const { admin, userA } = await seedUsers();

    const noAuthResponse = await app.request("/users");
    expect(noAuthResponse.status).toBe(401);

    const userLogin = await login(userA.email, USER_PASSWORD);
    const forbiddenResponse = await requestWithCookie(
      "/users",
      userLogin.cookie,
    );
    expect(forbiddenResponse.status).toBe(403);

    const adminLogin = await login(admin.email, ADMIN_PASSWORD);
    const adminResponse = await requestWithCookie("/users", adminLogin.cookie);

    expect(adminResponse.status).toBe(200);
    expect(
      UserSummaryResponseSchema.array().parse(await adminResponse.json()),
    ).toHaveLength(3);
  });

  it("supports the ticket lifecycle and enforces owner/admin authorization", async () => {
    const { admin, userA, userB } = await seedUsers();

    const userALogin = await login(userA.email, USER_PASSWORD);
    const userBTicketViewLogin = await login(userB.email, USER_PASSWORD);

    const createResponse = await createTicket(userALogin.cookie, {
      title: "Printer issue",
      description: "The printer does not respond.",
      priority: "MEDIUM",
    });

    expect(createResponse.status).toBe(201);

    const createdTicket = TicketResponseSchema.parse(
      await createResponse.json(),
    );
    trackTicket(createdTicket.id);

    expect(createdTicket.createdBy).toEqual({
      id: userA.id,
      name: userA.name,
    });
    expect(createdTicket.assignedTo).toBeNull();
    expect(createdTicket.priority).toBe("MEDIUM");
    expect(createdTicket.status).toBe("OPEN");

    const storedCreatedTicket = await prisma.ticket.findUnique({
      where: { id: createdTicket.id },
    });

    expect(storedCreatedTicket).not.toBeNull();
    expect(storedCreatedTicket?.createdById).toBe(userA.id);
    expect(storedCreatedTicket?.status).toBe("OPEN");
    expect(storedCreatedTicket?.priority).toBe("MEDIUM");

    const readByOtherUser = await requestWithCookie(
      `/tickets/${createdTicket.id}`,
      userBTicketViewLogin.cookie,
    );
    expect(readByOtherUser.status).toBe(200);

    const forbiddenUpdate = await requestWithCookie(
      `/tickets/${createdTicket.id}`,
      userBTicketViewLogin.cookie,
      {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: "Printer issue updated by foreign user",
          description: "Should not be allowed.",
          status: "IN_PROGRESS",
          priority: "HIGH",
          assignedToId: null,
        }),
      },
    );
    expect(forbiddenUpdate.status).toBe(403);

    const forbiddenDelete = await requestWithCookie(
      `/tickets/${createdTicket.id}`,
      userBTicketViewLogin.cookie,
      {
        method: "DELETE",
      },
    );
    expect(forbiddenDelete.status).toBe(403);

    const adminLogin = await login(admin.email, ADMIN_PASSWORD);
    const adminUpdate = await requestWithCookie(
      `/tickets/${createdTicket.id}`,
      adminLogin.cookie,
      {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: "Printer issue resolved",
          description: "The printer has been checked by admin.",
          status: "CLOSED",
          priority: "HIGH",
          assignedToId: userB.id,
        }),
      },
    );

    expect(adminUpdate.status).toBe(200);

    const updatedTicket = TicketResponseSchema.parse(await adminUpdate.json());

    expect(updatedTicket.assignedTo).toEqual({
      id: userB.id,
      name: userB.name,
    });
    expect(updatedTicket.status).toBe("CLOSED");
    expect(updatedTicket.priority).toBe("HIGH");

    const storedUpdatedTicket = await prisma.ticket.findUnique({
      where: { id: createdTicket.id },
    });

    expect(storedUpdatedTicket?.assignedToId).toBe(userB.id);
    expect(storedUpdatedTicket?.status).toBe("CLOSED");
    expect(storedUpdatedTicket?.priority).toBe("HIGH");

    const adminUnassign = await requestWithCookie(
      `/tickets/${createdTicket.id}`,
      adminLogin.cookie,
      {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: "Printer issue resolved",
          description: "The printer has been checked by admin.",
          status: "CLOSED",
          priority: "HIGH",
          assignedToId: null,
        }),
      },
    );

    expect(adminUnassign.status).toBe(200);
    const adminUnassignBody = TicketResponseSchema.parse(
      await adminUnassign.json(),
    );
    expect(adminUnassignBody.assignedTo).toBeNull();

    const deleteResponse = await requestWithCookie(
      `/tickets/${createdTicket.id}`,
      adminLogin.cookie,
      {
        method: "DELETE",
      },
    );

    expect(deleteResponse.status).toBe(204);
    expect(
      await prisma.ticket.findUnique({
        where: { id: createdTicket.id },
      }),
    ).toBeNull();
  });

  it("returns representative validation and not-found responses", async () => {
    const { userA } = await seedUsers();
    const userLogin = await login(userA.email, USER_PASSWORD);

    const invalidTicketRequest = await requestWithCookie(
      "/tickets",
      userLogin.cookie,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          description: "Missing title should fail.",
        }),
      },
    );
    expect(invalidTicketRequest.status).toBe(400);

    const invalidUuidResponse = await requestWithCookie(
      "/tickets/not-a-uuid",
      userLogin.cookie,
    );
    expect(invalidUuidResponse.status).toBe(400);

    const missingTicketResponse = await requestWithCookie(
      `/tickets/${crypto.randomUUID()}`,
      userLogin.cookie,
    );
    expect(missingTicketResponse.status).toBe(404);
  });
});
