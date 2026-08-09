import { describe, expect, it } from "vitest";

import {
  TicketForbiddenError,
  TicketNotFoundError,
} from "@application/errors/ticket-errors.js";
import { buildCreateTicket } from "@application/services/build-create-ticket.js";
import { buildDeleteTicket } from "@application/services/build-delete-ticket.js";
import { buildUpdateTicket } from "@application/services/build-update-ticket.js";
import {
  createAdminAuthenticatedUser,
  createAuthenticatedUser,
  createLogger,
  createTicketModel,
  createTicketRepository,
  createTicketWithUsers,
} from "./test-helpers.js";

const currentUser = createAuthenticatedUser();
const adminUser = createAdminAuthenticatedUser();
const logger = createLogger();

describe("buildCreateTicket", () => {
  it("creates a ticket for the authenticated user", async () => {
    const ticketRepository = createTicketRepository({
      findByIdResult: null,
    });

    const createTicket = buildCreateTicket(ticketRepository, logger);
    const input = {
      title: "Login issue",
      description: "Cannot log in",
      priority: "MEDIUM" as const,
      createdById: currentUser.id,
    };

    const result = await createTicket(input);

    expect(result).toEqual(createTicketModel());
    expect(ticketRepository.create).toHaveBeenCalledWith(input);
  });
});

describe("buildUpdateTicket", () => {
  it("lets the owner update their own ticket", async () => {
    const existingTicket = createTicketModel();
    const updatedTicket = createTicketWithUsers({
      title: "Updated title",
      description: "Updated description",
      status: "IN_PROGRESS",
      priority: "HIGH",
      assignedToId: null,
      createdById: currentUser.id,
      createdByName: currentUser.name,
      updatedAt: new Date("2026-01-01T01:00:00.000Z"),
    });

    const ticketRepository = createTicketRepository({
      findByIdResult: existingTicket,
      findByIdWithUsersResult: updatedTicket,
      updateResult: createTicketModel(),
    });

    const updateTicket = buildUpdateTicket(ticketRepository, logger);
    const input = {
      title: "Updated title",
      description: "Updated description",
      status: "IN_PROGRESS" as const,
      priority: "HIGH" as const,
      assignedToId: null,
    };

    const result = await updateTicket(existingTicket.id, input, currentUser);

    expect(result).toEqual(updatedTicket);
    expect(ticketRepository.update).toHaveBeenCalledWith(
      existingTicket.id,
      input,
    );
  });

  it("rejects a normal user updating a foreign ticket", async () => {
    const existingTicket = createTicketModel({ createdById: "other-user" });
    const ticketRepository = createTicketRepository({
      findByIdResult: existingTicket,
    });

    const updateTicket = buildUpdateTicket(ticketRepository, logger);

    await expect(
      updateTicket(
        existingTicket.id,
        {
          title: "Updated title",
          description: "Updated description",
          status: "CLOSED",
          priority: "HIGH",
          assignedToId: "assignee-1",
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(TicketForbiddenError);

    expect(ticketRepository.update).not.toHaveBeenCalled();
  });

  it("lets an admin update another user's ticket", async () => {
    const existingTicket = createTicketModel({ createdById: "other-user" });
    const updatedTicket = createTicketWithUsers({
      title: "Admin updated title",
      description: "Admin updated description",
      status: "IN_PROGRESS",
      priority: "HIGH",
      assignedToId: null,
      createdById: existingTicket.createdById,
      createdByName: "Other User",
      assignedToName: null,
      updatedAt: new Date("2026-01-01T01:00:00.000Z"),
    });

    const ticketRepository = createTicketRepository({
      findByIdResult: existingTicket,
      findByIdWithUsersResult: updatedTicket,
      updateResult: createTicketModel(),
    });

    const updateTicket = buildUpdateTicket(ticketRepository, logger);
    const input = {
      title: "Admin updated title",
      description: "Admin updated description",
      status: "IN_PROGRESS" as const,
      priority: "HIGH" as const,
      assignedToId: null,
    };

    const result = await updateTicket(existingTicket.id, input, adminUser);

    expect(result).toEqual(updatedTicket);
    expect(ticketRepository.update).toHaveBeenCalledWith(
      existingTicket.id,
      input,
    );
  });

  it("lets an admin assign a ticket", async () => {
    const existingTicket = createTicketModel({ createdById: "other-user" });
    const updatedTicket = createTicketWithUsers({
      title: "Admin updated title",
      description: "Admin updated description",
      status: "IN_PROGRESS",
      priority: "HIGH",
      assignedToId: "assignee-1",
      createdById: existingTicket.createdById,
      createdByName: "Other User",
      assignedToName: "Assignee One",
      updatedAt: new Date("2026-01-01T01:00:00.000Z"),
    });

    const ticketRepository = createTicketRepository({
      findByIdResult: existingTicket,
      findByIdWithUsersResult: updatedTicket,
      updateResult: createTicketModel(),
    });

    const updateTicket = buildUpdateTicket(ticketRepository, logger);
    const input = {
      title: "Admin updated title",
      description: "Admin updated description",
      status: "IN_PROGRESS" as const,
      priority: "HIGH" as const,
      assignedToId: "assignee-1",
    };

    const result = await updateTicket(existingTicket.id, input, adminUser);

    expect(result).toEqual(updatedTicket);
    expect(ticketRepository.update).toHaveBeenCalledWith(
      existingTicket.id,
      input,
    );
  });

  it("lets an admin unassign a ticket", async () => {
    const existingTicket = createTicketModel({
      createdById: "other-user",
      assignedToId: "assignee-1",
    });
    const updatedTicket = createTicketWithUsers({
      title: "Admin updated title",
      description: "Admin updated description",
      status: "IN_PROGRESS",
      priority: "HIGH",
      assignedToId: null,
      createdById: existingTicket.createdById,
      createdByName: "Other User",
      assignedToName: null,
      updatedAt: new Date("2026-01-01T02:00:00.000Z"),
    });

    const ticketRepository = createTicketRepository({
      findByIdResult: existingTicket,
      findByIdWithUsersResult: updatedTicket,
      updateResult: createTicketModel(),
    });

    const updateTicket = buildUpdateTicket(ticketRepository, logger);
    const input = {
      title: "Admin updated title",
      description: "Admin updated description",
      status: "IN_PROGRESS" as const,
      priority: "HIGH" as const,
      assignedToId: null,
    };

    const result = await updateTicket(existingTicket.id, input, adminUser);

    expect(result).toEqual(updatedTicket);
    expect(ticketRepository.update).toHaveBeenCalledWith(
      existingTicket.id,
      input,
    );
  });

  it("throws TicketNotFoundError for a missing ticket", async () => {
    const ticketRepository = createTicketRepository({
      findByIdResult: null,
    });

    const updateTicket = buildUpdateTicket(ticketRepository, logger);

    await expect(
      updateTicket(
        "ticket-404",
        {
          title: "Updated title",
          description: "Updated description",
          status: "OPEN",
          priority: "LOW",
          assignedToId: null,
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(TicketNotFoundError);
  });
});

describe("buildDeleteTicket", () => {
  it("lets the owner delete their own ticket", async () => {
    const existingTicket = createTicketModel();
    const ticketRepository = createTicketRepository({
      findByIdResult: existingTicket,
    });

    const deleteTicket = buildDeleteTicket(ticketRepository, logger);

    await deleteTicket(existingTicket.id, currentUser);

    expect(ticketRepository.delete).toHaveBeenCalledWith(existingTicket.id);
  });

  it("rejects a normal user deleting a foreign ticket", async () => {
    const existingTicket = createTicketModel({ createdById: "other-user" });
    const ticketRepository = createTicketRepository({
      findByIdResult: existingTicket,
    });

    const deleteTicket = buildDeleteTicket(ticketRepository, logger);

    await expect(
      deleteTicket(existingTicket.id, currentUser),
    ).rejects.toBeInstanceOf(TicketForbiddenError);
    expect(ticketRepository.delete).not.toHaveBeenCalled();
  });

  it("lets an admin delete a foreign ticket", async () => {
    const existingTicket = createTicketModel({ createdById: "other-user" });
    const ticketRepository = createTicketRepository({
      findByIdResult: existingTicket,
    });

    const deleteTicket = buildDeleteTicket(ticketRepository, logger);

    await deleteTicket(existingTicket.id, adminUser);

    expect(ticketRepository.delete).toHaveBeenCalledWith(existingTicket.id);
  });

  it("throws TicketNotFoundError for a missing ticket", async () => {
    const ticketRepository = createTicketRepository({
      findByIdResult: null,
    });

    const deleteTicket = buildDeleteTicket(ticketRepository, logger);

    await expect(
      deleteTicket("ticket-404", currentUser),
    ).rejects.toBeInstanceOf(TicketNotFoundError);
  });
});
