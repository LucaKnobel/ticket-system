import * as z from "zod";

export const UuidSchema = z.uuid();

export const UpdateTicketParamSchema = z.object({
  id: UuidSchema,
});

export type UpdateTicketParamDto = z.infer<typeof UpdateTicketParamSchema>;
