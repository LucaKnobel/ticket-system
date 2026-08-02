import { prisma } from "@infrastructure/db/prisma.js";
import type { SessionRepository } from "@application/interfaces/session-repository.js";
import type { Session } from "@application/models/session.js";
import type { Prisma } from "@generated/prisma/client.js";

type PrismaSession = Prisma.SessionGetPayload<{}>;

const toDomainSession = (row: PrismaSession): Session => ({
  id: row.id,
  tokenHash: row.tokenHash,
  userId: row.userId,
  expiresAt: row.expiresAt,
  createdAt: row.createdAt,
});

export const prismaSessionRepository: SessionRepository = {
  async create(session: Session): Promise<Session> {
    const row = await prisma.session.create({
      data: {
        tokenHash: session.tokenHash,
        userId: session.userId,
        expiresAt: session.expiresAt,
      },
    });

    return toDomainSession(row);
  },

  async findByTokenHash(tokenHash: string): Promise<Session | null> {
    const row = await prisma.session.findUnique({
      where: { tokenHash },
    });

    return row ? toDomainSession(row) : null;
  },

  async deleteByTokenHash(tokenHash: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { tokenHash },
    });
  },
};
