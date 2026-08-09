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
 * Compact user summary used inside ticket responses.
 */
export type TicketUserSummaryDto = {
  id: string;
  name: string;
};

/**
 * Ticket response payload shared between the frontend and backend.
 */
export const TicketResponseSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string(),
  status: z.enum(["OPEN", "IN_PROGRESS", "CLOSED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),

  createdBy: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),

  assignedTo: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
    })
    .nullable(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

/**
 * Inferred ticket response type.
 */
export type TicketResponseDto = z.infer<typeof TicketResponseSchema>;
