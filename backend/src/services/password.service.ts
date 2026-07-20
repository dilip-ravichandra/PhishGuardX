import bcrypt from 'bcrypt';

// 12 rounds is the widely-recommended balance of security vs. login latency
// as of 2026 hardware; documented here since Volume 2 specifies "Bcrypt
// hashing" and "Salt generation" but not a concrete cost factor.
const SALT_ROUNDS = 12;

export const passwordService = {
  async hash(plainTextPassword: string): Promise<string> {
    return bcrypt.hash(plainTextPassword, SALT_ROUNDS);
  },

  async verify(plainTextPassword: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, passwordHash);
  }
};
