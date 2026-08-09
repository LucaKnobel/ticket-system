import crypto from "crypto";

import type { SessionTokenHasher } from "@application/interfaces/session-token-hasher.js";

export const sha256SessionTokenHasher: SessionTokenHasher = {
  hash(sessionToken: string): string {
    const hash = crypto.createHash("sha256");
    hash.update(sessionToken);
    return hash.digest("hex");
  },
};
