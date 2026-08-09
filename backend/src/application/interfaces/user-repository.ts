import type { User } from "@application/models/user.js";

/**
 * Persistence interface for user data.
 */
export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;

  findById(id: string): Promise<User | null>;
}
