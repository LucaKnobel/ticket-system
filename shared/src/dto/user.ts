import * as z from "zod";

/**
 * Minimal user summary payload shared between frontend and backend.
 */
export const UserSummaryResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
});

/**
 * Inferred user summary response type.
 */
export type UserSummaryResponseDto = z.infer<typeof UserSummaryResponseSchema>;
