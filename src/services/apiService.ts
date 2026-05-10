import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { PasswordEntry } from "../types";
import { encrypt, decrypt } from "./encryptionService";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { Alert } from "react-native";

// Change to your Vercel URL after deploying
// const BASE_URL = process.env.EXPO_PUBLIC_LOCAL_BACKEND;
const BASE_URL = process.env.EXPO_PUBLIC_DEPLOYED_BACKEND;

// Axios instance that auto-attaches JWT token
const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  // console.log("API Request:", config.method?.toUpperCase(), config.url);
  const token = await SecureStore.getItemAsync("jwt_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
  offlineAccess: true,
});

// ─── Auth ──────────────────────────────────────────────
export const signIn = async () => {
  try {
    // console.log("Current Config:", await GoogleSignin.getCurrentUser());
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();

    if (!isSuccessResponse(response)) {
      console.log("Sign in cancelled");
      return null;
    }

    const { idToken } = response.data;

    if (!idToken) {
      throw new Error("No idToken received from Google");
    }

    const res = await api.post("/auth/google", { idToken });

    // Save JWT for all future API calls
    await SecureStore.setItemAsync("jwt_token", res.data.token);

    return res.data.user;
  } catch (error) {
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.IN_PROGRESS:
          Alert.alert("Error : Status is in Progress");
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          Alert.alert("Error : Play Services is Not Available");
          break;
        default:
          console.log("Sign in error : ", error.message);
          break;
      }
    } else {
      console.log("An error Occured!");
      Alert.alert("An error Occured!");
    }
  }
};

// ─── Passwords ─────────────────────────────────────────

// Encrypt before sending to backend
const encryptEntry = (
  entry: Partial<PasswordEntry>,
  userId: string,
  googleId: string
) => ({
  ...entry,
  //   username: entry.username ? encrypt(entry.username, userId) : "",
  password: entry.password ? encrypt(entry.password, userId, googleId) : "",
  //   notes: entry.notes ? encrypt(entry.notes, userId) : "",
});

// Decrypt after receiving from backend
const decryptEntry = (
  entry: any,
  userId: string,
  googleId: string
): PasswordEntry => ({
  ...entry,
  //   username: entry.username ? decrypt(entry.username, userId) : "",
  password: entry.password ? decrypt(entry.password, userId, googleId) : "",
  //   notes: entry.notes ? decrypt(entry.notes, userId) : "",
});

export const getAllPasswords = async (): Promise<PasswordEntry[]> => {
  const res = await api.get("/passwords");
  // Save JWT for all future API calls - This is the refresh token received from backend
  await SecureStore.setItemAsync("jwt_token", res.data.token);
  return res.data.passwords;
};

export const getPasswordWithID = async (
  userId: string,
  pass_id: string,
  googleId: string
): Promise<PasswordEntry | null> => {
  const res = await api.get(`/passwords/${pass_id}`);
  return res.data ? decryptEntry(res.data, userId, googleId) : null;
};

export const addPassword = async (
  entry: Partial<PasswordEntry>,
  userId: string,
  googleId: string
) => {
  const encrypted = encryptEntry(entry, userId, googleId);
  const res = await api.post("/passwords", encrypted);
  return decryptEntry(res.data, userId, googleId);
};

export const updatePassword = async (
  id: string,
  entry: Partial<PasswordEntry>,
  userId: string,
  googleId: string
) => {
  const encrypted = encryptEntry(entry, userId, googleId);
  const res = await api.put(`/passwords/${id}`, encrypted);
  return decryptEntry(res.data, userId, googleId);
};

export const deletePassword = async (id: string) => {
  await api.delete(`/passwords/${id}`);
};

// ─── Profile ───────────────────────────────────────────────────────────────

export const getProfile = async () => {
  const res = await api.get("/profile");
  return res.data; // { user, counts }
};

export const updateSavedFields = async (
  savedEmails: string[],
  savedPhones: string[]
) => {
  const res = await api.put("/profile/saved-fields", {
    savedEmails,
    savedPhones,
  });
  return res.data;
};
