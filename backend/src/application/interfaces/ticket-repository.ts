import type {
  Ticket,
  TicketPriority,
  TicketStatus,
  TicketWithUsers,
} from "@application/models/ticket.js";

export type CreateTicketInput = {
  title: string;
  description: string;
  priority: TicketPriority;
  createdById: string;
};

export type UpdateTicketInput = {
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedToId: string | null;
};

export interface TicketRepository {
  findAllWithUsers(): Promise<TicketWithUsers[]>;
  findById(id: string): Promise<Ticket | null>;
  findByIdWithUsers(id: string): Promise<TicketWithUsers | null>;
  create(data: CreateTicketInput): Promise<Ticket>;
  update(id: string, data: UpdateTicketInput): Promise<Ticket>;
  delete(id: string): Promise<void>;
}
