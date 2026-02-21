import CryptoJS from "crypto-js";

// Derive a key from user's Google ID — unique per user
const deriveKey = (userId: string): string => {
  const salt = "12345678901234567890123456789012"; // hardcode a random string
  return CryptoJS.PBKDF2(userId, salt, {
    keySize: 256 / 32,
    iterations: 1000,
  }).toString();
};

export const encrypt = (text: string, userId: string): string => {
  if (!text) return "";
  const key = deriveKey(userId);
  return CryptoJS.AES.encrypt(text, key).toString();
};

export const decrypt = (cipherText: string, userId: string): string => {
  if (!cipherText) return "";
  const key = deriveKey(userId);
  const bytes = CryptoJS.AES.decrypt(cipherText, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};
