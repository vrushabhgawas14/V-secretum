import { AES, PBKDF2, enc } from "crypto-es";

// Derive a key from user's Google ID — unique per user
const deriveKey = (userId: string): string => {
  const salt = "12345678901234567890123456789012"; // hardcode a random string
  return PBKDF2(userId, salt, {
    keySize: 256 / 32,
    iterations: 1000,
  }).toString();
};

export const encrypt = (text: string, userId: string): string => {
  if (!text) return "";
  console.log("Text in Encrypt:", text);
  const key = deriveKey(userId);
  console.log("Got Keys: ", key);
  // const cipherText = AES.encrypt(text, key, {
  //   mode: mode.CBC,
  //   padding: pad.Pkcs7,
  // }).toString();
  // console.log("Cipher Text: ", cipherText);
  // return cipherText;
  return AES.encrypt(text, key).toString();

  // return CryptoJS.AES.encrypt(text, key).toString();
};

export const decrypt = (cipherText: string, userId: string): string => {
  if (!cipherText) return "";
  const key = deriveKey(userId);
  // const bytes = CryptoES.AES.decrypt(cipherText, key);
  const bytes = AES.decrypt(cipherText, key);

  return bytes.toString(enc.Utf8);
};
