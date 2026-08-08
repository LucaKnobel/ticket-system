export interface SessionTokenHasher {
  hash(sessionToken: string): string;
}
