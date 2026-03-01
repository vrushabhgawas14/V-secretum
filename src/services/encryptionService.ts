import { AES, PBKDF2, Utf8 } from "crypto-es";

/**
 * Derives a deterministic key unique to the user.
 * @param userId - The MongoDB _id of the user
 * @param googleId - The Google UID of the user
 */

const deriveKey = (userId: string, googleId: string) => {
  const salt = userId + googleId.substring(0, 8);
  if (salt.length != 32) return "";
  return PBKDF2(userId, salt, {
    keySize: 256 / 32,
    iterations: 1000,
  });
};

export const encrypt = (
  text: string,
  userId: string,
  googleId: string
): string => {
  if (!text) return "";
  const key = deriveKey(userId, googleId);
  return AES.encrypt(text, key).toString();
};

export const decrypt = (
  cipherText: string,
  userId: string,
  googleId: string
): string => {
  if (!cipherText) return "";
  const key = deriveKey(userId, googleId);
  const bytes = AES.decrypt(cipherText, key);
  return bytes.toString(Utf8);
};
