import crypto from 'crypto';

export function generateToken() {
  // 32 bytes => ~43 chars base64url (unguessable)
  return crypto.randomBytes(32).toString("base64url");
}

export function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}
