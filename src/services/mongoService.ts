import axios from "axios";
import { PasswordEntry } from "../types";
import { encrypt, decrypt } from "./encryptionService";

const BASE_URL =
  "https://data.mongodb-api.com/app/YOUR_APP_ID/endpoint/data/v1";
const API_KEY = "YOUR_ATLAS_DATA_API_KEY"; // from Atlas → App Services → API Keys

const headers = {
  "Content-Type": "application/json",
  "api-key": API_KEY,
};

const DB = "passwordManager";
const COLLECTION = "passwords";

// Encrypt sensitive fields before saving
const encryptEntry = (entry: PasswordEntry, userId: string) => ({
  ...entry,
  username: encrypt(entry.username!, userId),
  password: encrypt(entry.password, userId),
  notes: entry.notes ? encrypt(entry.notes, userId) : "",
});

// Decrypt sensitive fields after fetching
const decryptEntry = (entry: any, userId: string): PasswordEntry => ({
  ...entry,
  username: decrypt(entry.username, userId),
  password: decrypt(entry.password, userId),
  notes: entry.notes ? decrypt(entry.notes, userId) : "",
});

export const getAllPasswords = async (
  userId: string,
): Promise<PasswordEntry[]> => {
  const res = await axios.post(
    `${BASE_URL}/action/find`,
    {
      dataSource: "Cluster0",
      database: DB,
      collection: COLLECTION,
      filter: { owner_id: userId },
      sort: { updatedAt: -1 },
    },
    { headers },
  );

  return (res.data.documents || []).map((doc: any) =>
    decryptEntry(doc, userId),
  );
};

export const addPassword = async (entry: PasswordEntry, userId: string) => {
  const encrypted = encryptEntry(entry, userId);
  await axios.post(
    `${BASE_URL}/action/insertOne`,
    {
      dataSource: "Cluster0",
      database: DB,
      collection: COLLECTION,
      document: { ...encrypted, createdAt: new Date(), updatedAt: new Date() },
    },
    { headers },
  );
};

export const updatePassword = async (
  id: string,
  entry: PasswordEntry,
  userId: string,
) => {
  const encrypted = encryptEntry(entry, userId);
  await axios.post(
    `${BASE_URL}/action/updateOne`,
    {
      dataSource: "Cluster0",
      database: DB,
      collection: COLLECTION,
      filter: { _id: { $oid: id } },
      update: { $set: { ...encrypted, updatedAt: new Date() } },
    },
    { headers },
  );
};

export const deletePassword = async (id: string) => {
  await axios.post(
    `${BASE_URL}/action/deleteOne`,
    {
      dataSource: "Cluster0",
      database: DB,
      collection: COLLECTION,
      filter: { _id: { $oid: id } },
    },
    { headers },
  );
};
