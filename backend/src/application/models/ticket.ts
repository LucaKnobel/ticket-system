/**
 * Supported statuses for tickets in the ticket system.
 */
export const ticketStatuses = ["OPEN", "IN_PROGRESS", "CLOSED"] as const;

/**
 * Union type representing a supported ticket status.
 */
export type TicketStatus = (typeof ticketStatuses)[number];

/**
 * Supported priorities for tickets in the ticket system.
 */
export const ticketPriorities = ["LOW", "MEDIUM", "HIGH"] as const;

/**
 * Union type representing a supported ticket priority.
 */
export type TicketPriority = (typeof ticketPriorities)[number];

/**
 * Represents a persisted ticket in the application.
 */
export type Ticket = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdById: string;
  assignedToId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Read model used for ticket listing responses that need user details.
 */
export type TicketWithUsers = Ticket & {
  createdByName: string;
  assignedToName: string | null;
};
