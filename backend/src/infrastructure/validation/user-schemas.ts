import * as z from "zod";
import { userRoles } from "@application/models/user.js";

const EmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Invalid email address"));

/**
 * Request body schema for email/password sign-in.
 */
export const LoginUserBodySchema = z.object({
  email: EmailSchema,
  // At login, we only verify the password field is present and non-empty.
  password: z
    .string()
    .min(1, "Password is required")
    .max(255, "Password must not exceed 255 characters"),
});

export const LoginUserResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  role: z.enum(userRoles),
});

export type LoginUserBodyDto = z.infer<typeof LoginUserBodySchema>;
export type LoginUserResponseDto = z.infer<typeof LoginUserResponseSchema>;
