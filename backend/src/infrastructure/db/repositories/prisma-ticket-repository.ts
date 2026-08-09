import { prisma } from "@infrastructure/db/prisma.js";
import type {
  CreateTicketInput,
  TicketRepository,
  UpdateTicketInput,
} from "@application/interfaces/ticket-repository.js";
import type {
  Ticket,
  TicketPriority,
  TicketStatus,
  TicketWithUsers,
} from "@application/models/ticket.js";
import type { Prisma } from "@generated/prisma/client.js";

type PrismaTicket = Prisma.TicketGetPayload<{}>;
type PrismaTicketWithUsers = Prisma.TicketGetPayload<{
  include: {
    createdBy: {
      select: {
        id: true;
        name: true;
      };
    };
    assignedTo: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;

const toDomainTicket = (row: PrismaTicket): Ticket => ({
  id: row.id,
  title: row.title,
  description: row.description,
  status: row.status as TicketStatus,
  priority: row.priority as TicketPriority,
  createdById: row.createdById,
  assignedToId: row.assignedToId,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const toDomainTicketWithUsers = (
  row: PrismaTicketWithUsers,
): TicketWithUsers => ({
  ...toDomainTicket(row),
  createdByName: row.createdBy.name,
  assignedToName: row.assignedTo?.name ?? null,
});

export const prismaTicketRepository: TicketRepository = {
  async findAll(): Promise<Ticket[]> {
    const rows = await prisma.ticket.findMany();

    return rows.map(toDomainTicket);
  },

  async findAllWithUsers(): Promise<TicketWithUsers[]> {
    const rows = await prisma.ticket.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return rows.map(toDomainTicketWithUsers);
  },

  async findById(id: string): Promise<Ticket | null> {
    const row = await prisma.ticket.findUnique({
      where: { id },
    });

    return row ? toDomainTicket(row) : null;
  },

  async findByIdWithUsers(id: string): Promise<TicketWithUsers | null> {
    const row = await prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return row ? toDomainTicketWithUsers(row) : null;
  },

  async create(input: CreateTicketInput): Promise<Ticket> {
    const data: Prisma.TicketCreateInput = {
      title: input.title,
      description: input.description,
      priority: input.priority,
      createdBy: {
        connect: { id: input.createdById },
      },
    };

    const row = await prisma.ticket.create({ data });

    return toDomainTicket(row);
  },

  async update(id: string, input: UpdateTicketInput): Promise<Ticket> {
    const data: Prisma.TicketUpdateInput = {
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      assignedTo: input.assignedToId
        ? {
            connect: { id: input.assignedToId },
          }
        : {
            disconnect: true,
          },
    };

    const row = await prisma.ticket.update({
      where: { id },
      data,
    });

    return toDomainTicket(row);
  },

  async delete(id: string): Promise<void> {
    await prisma.ticket.delete({
      where: { id },
    });
  },
};
