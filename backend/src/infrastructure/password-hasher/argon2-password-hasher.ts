import argon2 from "argon2";
import type { PasswordHasher } from "@application/interfaces/password-hasher.js";

/**
 * Argon2-based password hasher implementation.
 */
export const argon2PasswordHasher: PasswordHasher = {
  async hash(password: string): Promise<string> {
    return argon2.hash(password);
  },

  async verify(password: string, passwordHash: string): Promise<boolean> {
    return argon2.verify(passwordHash, password);
  },
};
