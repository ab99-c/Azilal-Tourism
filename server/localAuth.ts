import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, KEY_LENGTH) as Buffer;
  return `scrypt$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  if (!stored) return false;
  const [algorithm, encodedSalt, encodedHash] = stored.split("$");
  if (algorithm !== "scrypt" || !encodedSalt || !encodedHash) return false;
  try {
    const salt = Buffer.from(encodedSalt, "base64url");
    const expected = Buffer.from(encodedHash, "base64url");
    if (salt.length < 16 || expected.length !== KEY_LENGTH) return false;
    const derived = await scrypt(password, salt, KEY_LENGTH) as Buffer;
    return timingSafeEqual(expected, derived);
  } catch {
    return false;
  }
}

export function isValidBootstrapSecret(candidate: string): boolean {
  const expected = process.env.AUTH_BOOTSTRAP_SECRET?.trim();
  if (!expected || expected.length < 12 || candidate.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(candidate), Buffer.from(expected));
}
