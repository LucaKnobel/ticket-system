import * as z from "zod";

/**
 * Ticket creation request payload shared between the frontend and backend.
 */
export const CreateTicketRequestSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(5000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("LOW"),
});

/**
 * Inferred ticket creation request type.
 */
export type CreateTicketRequestDto = z.infer<typeof CreateTicketRequestSchema>;

/**
 * Ticket response payload shared between the frontend and backend.
 */
export const TicketResponseSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string(),
  status: z.enum(["OPEN", "IN_PROGRESS", "CLOSED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  createdById: z.uuid(),
  createdByName: z.string(),
  assignedToId: z.uuid().nullable(),
  assignedToName: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

/**
 * Inferred ticket response type.
 */
export type TicketResponseDto = z.infer<typeof TicketResponseSchema>;
