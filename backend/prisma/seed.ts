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
 * This seed is idempotent and can safely be executed multiple times.
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
      },
      create: user,
    });
  }

  console.log("Database successfully seeded.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
