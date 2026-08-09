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
 * Minimal user representation embedded in ticket responses.
 */
export const TicketUserSummarySchema = z.object({
  id: z.uuid(),
  name: z.string(),
});

/**
 * Inferred ticket user summary type.
 */
export type TicketUserSummaryDto = z.infer<typeof TicketUserSummarySchema>;

/**
 * Ticket response payload shared between the frontend and backend.
 */
export const TicketResponseSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string(),
  status: z.enum(["OPEN", "IN_PROGRESS", "CLOSED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  createdBy: TicketUserSummarySchema,
  assignedTo: TicketUserSummarySchema.nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

/**
 * Inferred ticket response type.
 */
export type TicketResponseDto = z.infer<typeof TicketResponseSchema>;
