export type Category = "important" | "socials" | "least_important" | "work" | "other";

export interface PasswordEntry {
  _id?: string;
  owner: string;
  title: string;
  username?: string; // stored encrypted in DB, decrypted in app
  email?: string; // stored encrypted in DB, decrypted in app
  phoneNumber?: string; // stored encrypted in DB, decrypted in app
  password: string; // stored encrypted in DB, decrypted in app
  website?: string;
  notes?: string;
  category: Category;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id?: string;
  googleId: string;
  email: string;
  name: string;
  photoUrl?: string;
  savedEmails?: string[];
  savedPhones?: string[];
  createdAt?: Date;
}
