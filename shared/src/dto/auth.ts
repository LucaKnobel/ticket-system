import * as z from "zod";

/**
 * Login request payload shared between frontend and backend.
 */
export const LoginRequestSchema = z.object({
  email: z
    .string({ error: "Please enter your email address." })
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Please enter a valid email address." })),
  password: z
    .string({ error: "Please enter your password." })
    .min(1, "Please enter your password.")
    .max(255, "Maximum 255 characters."),
});

/**
 * Inferred login request type.
 */
export type LoginRequestDto = z.infer<typeof LoginRequestSchema>;

/**
 * Login response payload shared between frontend and backend.
 */
export const LoginResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  role: z.enum(["USER", "ADMIN"]),
});

/**
 * Inferred login response type.
 */
export type LoginResponseDto = z.infer<typeof LoginResponseSchema>;
