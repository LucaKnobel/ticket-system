import * as z from "zod";

/**
 * Ticket creation request payload shared between the frontend and backend.
 */
export const CreateTicketRequestSchema = z.object({
  title: z
    .string({ error: "Please enter a title for the ticket." })
    .min(1, "Please enter a title for the ticket.")
    .max(255, "Please keep the title short. Maximum 255 characters."),
  description: z
    .string({
      error: "Please add a short description so the ticket can be understood.",
    })
    .min(1, "Please add a short description so the ticket can be understood.")
    .max(5000, "Please shorten the description. Maximum 5000 characters."),
  priority: z
    .enum(["LOW", "MEDIUM", "HIGH"], {
      error: "Please choose a valid priority.",
    })
    .default("LOW"),
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

/**
 * Ticket update request payload shared between the frontend and backend.
 */
export const UpdateTicketRequestSchema = z.object({
  title: z
    .string({ error: "Please enter a title for the ticket." })
    .min(1, "Please enter a title for the ticket.")
    .max(255, "Please keep the title short. Maximum 255 characters."),
  description: z
    .string({
      error: "Please add a short description so the ticket can be understood.",
    })
    .min(1, "Please add a short description so the ticket can be understood.")
    .max(5000, "Please shorten the description. Maximum 5000 characters."),
  status: z.enum(["OPEN", "IN_PROGRESS", "CLOSED"], {
    error: "Please choose a valid status.",
  }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"], {
    error: "Please choose a valid priority.",
  }),
  assignedToId: z
    .uuid({ error: "Please select a valid assignee or leave the field empty." })
    .nullable(),
});

/**
 * Inferred ticket update request type.
 */
export type UpdateTicketRequestDto = z.infer<typeof UpdateTicketRequestSchema>;
