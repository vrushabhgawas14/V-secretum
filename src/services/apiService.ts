import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { PasswordEntry } from "../types";
import { encrypt, decrypt } from "./encryptionService";

// Change to your Vercel URL after deploying
// const BASE_URL = process.env.LOCAL_BACKEND;
const BASE_URL = process.env.DEPLOYED_BACKEND;

// Axios instance that auto-attaches JWT token
const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  console.log("Interceptors are called!");
  const token = await SecureStore.getItemAsync("jwt_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ──────────────────────────────────────────────

export const loginWithGoogle = async (googleUserInfo: {
  googleId: string;
  email: string;
  name: string;
  photoUrl?: string;
}) => {
  const res = await api.post("/auth/google", googleUserInfo);
  // Save JWT so all future requests are authenticated
  await SecureStore.setItemAsync("jwt_token", res.data.token);
  return res.data.user;
};

export const clearToken = async () => {
  await SecureStore.deleteItemAsync("jwt_token");
};

// ─── Passwords ─────────────────────────────────────────

// Encrypt before sending to backend
const encryptEntry = (entry: Partial<PasswordEntry>, userId: string) => ({
  ...entry,
  //   username: entry.username ? encrypt(entry.username, userId) : "",
  password: entry.password ? encrypt(entry.password, userId) : "",
  //   notes: entry.notes ? encrypt(entry.notes, userId) : "",
});

// Decrypt after receiving from backend
const decryptEntry = (entry: any, userId: string): PasswordEntry => ({
  ...entry,
  //   username: entry.username ? decrypt(entry.username, userId) : "",
  password: entry.password ? decrypt(entry.password, userId) : "",
  //   notes: entry.notes ? decrypt(entry.notes, userId) : "",
});

export const getAllPasswords = async (
  userId: string,
): Promise<PasswordEntry[]> => {
  const res = await api.get("/passwords");
  return res.data.map((e: any) => decryptEntry(e, userId));
};

export const addPassword = async (
  entry: Partial<PasswordEntry>,
  userId: string,
) => {
  const encrypted = encryptEntry(entry, userId);
  const res = await api.post("/passwords", encrypted);
  return decryptEntry(res.data, userId);
};

export const updatePassword = async (
  id: string,
  entry: Partial<PasswordEntry>,
  userId: string,
) => {
  const encrypted = encryptEntry(entry, userId);
  const res = await api.put(`/passwords/${id}`, encrypted);
  return decryptEntry(res.data, userId);
};

export const deletePassword = async (id: string) => {
  await api.delete(`/passwords/${id}`);
};
