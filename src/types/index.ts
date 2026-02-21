export type Category = "important" | "least_important" | "work" | "other";

export interface PasswordEntry {
  _id?: string;
  owner_id: string;
  app_title: string;
  username?: string; // stored encrypted in DB, decrypted in app
  email?: string; // stored encrypted in DB, decrypted in app
  phone_number?: string; // stored encrypted in DB, decrypted in app
  password: string; // stored encrypted in DB, decrypted in app
  category: Category;
  notes?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
}
