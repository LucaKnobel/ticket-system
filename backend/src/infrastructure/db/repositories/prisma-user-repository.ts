import { prisma } from "@infrastructure/db/prisma.js";
import type { UserRepository } from "@application/interfaces/user-repository.js";
import type { User } from "@application/models/user.js";
import type { Prisma } from "@generated/prisma/client.js";

type PrismaUser = Prisma.UserGetPayload<{}>;

const toDomainUser = (row: PrismaUser): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  passwordHash: row.passwordHash,
  role: row.role,
  deletedAt: row.deletedAt,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const prismaUserRepository: UserRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const row = await prisma.user.findUnique({
      where: { email },
    });

    return row ? toDomainUser(row) : null;
  },

  async findById(id: string): Promise<User | null> {
    const row = await prisma.user.findUnique({
      where: { id },
    });

    return row ? toDomainUser(row) : null;
  },

  async findAllActive(): Promise<User[]> {
    const rows = await prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        name: "asc",
      },
    });

    return rows.map(toDomainUser);
  },
};
