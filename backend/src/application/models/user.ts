/**
 * Supported roles for users in the ticket system.
 */
export const userRoles = ["USER", "ADMIN"] as const;

/**
 * Union type representing a supported user role.
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
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
