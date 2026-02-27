import { AES, PBKDF2, Utf8 } from "crypto-es";

const deriveKey = (userId: string) => {
  const salt = process.env.EXPO_PUBLIC_SECRET_SALT!;
  return PBKDF2(userId, salt, {
    keySize: 256 / 32,
    iterations: 1000,
  });
};

export const encrypt = (text: string, userId: string): string => {
  if (!text) return "";
  const key = deriveKey(userId);
  return AES.encrypt(text, key).toString();
};

export const decrypt = (cipherText: string, userId: string): string => {
  if (!cipherText) return "";
  const key = deriveKey(userId);
  const bytes = AES.decrypt(cipherText, key);
  return bytes.toString(Utf8);
};
