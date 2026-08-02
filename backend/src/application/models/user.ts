import type { Session } from "./session.js";

/**
 * Supported roles for users in the ticket system.
 */
export const userRoles = ["USER", "ADMIN"] as const;

/**
 * Union type for supported user roles.
 */
export type UserRole = (typeof userRoles)[number];

/**
 * Represents a persisted user in the application.
 */
export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  sessions?: Session[];
};
