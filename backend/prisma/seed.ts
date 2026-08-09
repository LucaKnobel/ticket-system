import "dotenv/config";

import argon2 from "argon2";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../generated/prisma/client.js";

/**
 * ===============================================================
 * Demo accounts for development and evaluation
 * ===============================================================
 *
 * Administrator
 * Email:    admin@example.com
 * Password: Admin!Ticket2026#
 *
 * Standard users
 * Password: TicketSystem!2026#
 *
 * - alice@example.com
 * - bob@example.com
 * - charlie@example.com
 *
 * This seed is idempotent and can be run multiple times safely.
 * Existing seed users and tickets are updated instead of being duplicated.
 * ===============================================================
 */

const connectionString = process.env.DATABASE_URL!;

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const ADMIN_PASSWORD = "Admin!Ticket2026#";
const USER_PASSWORD = "TicketSystem!2026#";

async function main() {
  const adminPasswordHash = await argon2.hash(ADMIN_PASSWORD);
  const userPasswordHash = await argon2.hash(USER_PASSWORD);

  /*
   * =============================================================
   * Users
   * =============================================================
   */

  const users: Prisma.UserCreateInput[] = [
    {
      name: "Administrator",
      email: "admin@example.com",
      role: "ADMIN",
      passwordHash: adminPasswordHash,
    },
    {
      name: "Alice Johnson",
      email: "alice@example.com",
      role: "USER",
      passwordHash: userPasswordHash,
    },
    {
      name: "Bob Miller",
      email: "bob@example.com",
      role: "USER",
      passwordHash: userPasswordHash,
    },
    {
      name: "Charlie Smith",
      email: "charlie@example.com",
      role: "USER",
      passwordHash: userPasswordHash,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {
        name: user.name,
        role: user.role,
        passwordHash: user.passwordHash,
        deletedAt: null,
      },
      create: user,
    });
  }

  /*
   * Retrieve the persisted users so their generated UUIDs can be
   * referenced by the ticket seed data.
   */

  const admin = await prisma.user.findUniqueOrThrow({
    where: {
      email: "admin@example.com",
    },
  });

  const alice = await prisma.user.findUniqueOrThrow({
    where: {
      email: "alice@example.com",
    },
  });

  const bob = await prisma.user.findUniqueOrThrow({
    where: {
      email: "bob@example.com",
    },
  });

  const charlie = await prisma.user.findUniqueOrThrow({
    where: {
      email: "charlie@example.com",
    },
  });

  /*
   * =============================================================
   * Tickets
   * =============================================================
   *
   * Tickets use fixed UUIDs so they can be upserted idempotently.
   * The UUIDs are only identifiers for deterministic seed data.
   */

  const tickets: Prisma.TicketUncheckedCreateInput[] = [
    {
      id: "00000000-0000-4000-8000-000000000001",
      title: "Can't log in",
      description:
        "I tried to log in several times, but I keep getting an invalid credentials message.",
      status: "OPEN",
      priority: "HIGH",
      createdById: alice.id,
      assignedToId: admin.id,
    },
    {
      id: "00000000-0000-4000-8000-000000000002",
      title: "Printer not working",
      description:
        "I can't print from my computer anymore. The office printer doesn't show up in the printer list.",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      createdById: bob.id,
      assignedToId: charlie.id,
    },
    {
      id: "00000000-0000-4000-8000-000000000003",
      title: "Forgot my password",
      description:
        "I forgot my password and can't access my account. Could someone please reset it?",
      status: "CLOSED",
      priority: "LOW",
      createdById: charlie.id,
      assignedToId: admin.id,
    },
    {
      id: "00000000-0000-4000-8000-000000000004",
      title: "Dashboard is very slow",
      description:
        "The ticket dashboard has been loading very slowly since this morning.",
      status: "OPEN",
      priority: "MEDIUM",
      createdById: alice.id,
      assignedToId: null,
    },
    {
      id: "00000000-0000-4000-8000-000000000005",
      title: "VPN not connecting",
      description:
        "I'm working from home and can't connect to the VPN. It fails every time I try.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      createdById: bob.id,
      assignedToId: admin.id,
    },
    {
      id: "00000000-0000-4000-8000-000000000006",
      title: "No access to shared folder",
      description:
        "I can see the shared project folder, but I get an access denied message when I open it.",
      status: "OPEN",
      priority: "MEDIUM",
      createdById: charlie.id,
      assignedToId: alice.id,
    },
    {
      id: "00000000-0000-4000-8000-000000000007",
      title: "Emails not syncing",
      description:
        "New emails show up in the browser, but they don't appear in my desktop mail app.",
      status: "CLOSED",
      priority: "MEDIUM",
      createdById: alice.id,
      assignedToId: bob.id,
    },
    {
      id: "00000000-0000-4000-8000-000000000008",
      title: "Need PDF editor",
      description:
        "I need a PDF editor installed on my computer for editing customer documents.",
      status: "OPEN",
      priority: "LOW",
      createdById: bob.id,
      assignedToId: null,
    },
    {
      id: "00000000-0000-4000-8000-000000000009",
      title: "Second monitor not working",
      description:
        "My second monitor stays black when I connect my laptop to the docking station.",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      createdById: charlie.id,
      assignedToId: bob.id,
    },
    {
      id: "00000000-0000-4000-8000-000000000010",
      title: "Account locked",
      description:
        "My account was locked after I entered the wrong password a few times. I can't log in anymore.",
      status: "CLOSED",
      priority: "HIGH",
      createdById: alice.id,
      assignedToId: admin.id,
    },
    {
      id: "00000000-0000-4000-8000-000000000011",
      title: "Wi-Fi keeps disconnecting",
      description:
        "My Wi-Fi connection keeps dropping every few minutes. It started happening today.",
      status: "OPEN",
      priority: "HIGH",
      createdById: bob.id,
      assignedToId: charlie.id,
    },
    {
      id: "00000000-0000-4000-8000-000000000012",
      title: "Wrong keyboard layout",
      description:
        "My keyboard layout changed after the last update and some keys now type the wrong characters.",
      status: "CLOSED",
      priority: "LOW",
      createdById: charlie.id,
      assignedToId: null,
    },
    {
      id: "00000000-0000-4000-8000-000000000013",
      title: "Can't upload attachment",
      description:
        "I tried to attach a PDF to a ticket, but the upload fails before it finishes.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      createdById: admin.id,
      assignedToId: alice.id,
    },
    {
      id: "00000000-0000-4000-8000-000000000014",
      title: "Certificate warning",
      description:
        "I get a certificate warning every time I open our internal website in the browser.",
      status: "OPEN",
      priority: "HIGH",
      createdById: alice.id,
      assignedToId: admin.id,
    },
    {
      id: "00000000-0000-4000-8000-000000000015",
      title: "Docking station USB not working",
      description:
        "My mouse and keyboard don't work when I connect them through the docking station.",
      status: "OPEN",
      priority: "MEDIUM",
      createdById: bob.id,
      assignedToId: null,
    },
  ];

  for (const ticket of tickets) {
    await prisma.ticket.upsert({
      where: {
        id: ticket.id,
      },
      update: {
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        createdById: ticket.createdById,
        assignedToId: ticket.assignedToId,
      },
      create: ticket,
    });
  }

  console.log(
    `Database successfully seeded with ${users.length} users and ${tickets.length} tickets.`,
  );
}

main()
  .catch((error) => {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
