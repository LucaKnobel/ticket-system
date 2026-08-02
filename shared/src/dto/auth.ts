import * as z from "zod";

/**
 * Login request payload shared between frontend and backend.
 */
export const LoginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(255),
});

/**
 * Inferred login request type.
 */
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

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
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
