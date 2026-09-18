import { hash, verify } from '@node-rs/argon2'

// OWASP recommended Argon2id parameters
const ARGON2_OPTIONS = {
  memoryCost: 19456,  // 19 MiB
  timeCost: 2,        // 2 iterations
  parallelism: 1,     // 1 lane
  outputLen: 32,      // 32 bytes
}

/**
 * Hash a plaintext password using Argon2id.
 * Returns a PHC string: $argon2id$v=19$m=19456,t=2,p=1$...
 */
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, ARGON2_OPTIONS)
}

/**
 * Verify a plaintext password against a stored Argon2id hash.
 * Timing-safe comparison is handled internally.
 */
export async function verifyPassword(
  storedHash: string,
  password: string
): Promise<boolean> {
  try {
    return await verify(storedHash, password)
  } catch {
    return false
  }
}
