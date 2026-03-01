import { create } from "zustand";
import { User } from "../types";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as SecureStore from "expo-secure-store";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isPinVerified: boolean;
  isHydrated: boolean;
  setUser: (user: User | null) => void;
  setPinVerified: (val: boolean) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
  setSavedFields: (emails: string[], phones: string[]) => void;
  updateUser: (fields: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set: any, get: any) => ({
  user: null,
  isAuthenticated: false,
  isPinVerified: false,
  isHydrated: false,

  setUser: async (user) => {
    if (user) {
      await SecureStore.setItemAsync("current_user", JSON.stringify(user));
    } else {
      await SecureStore.deleteItemAsync("current_user");
    }
    set({ user, isAuthenticated: !!user });
  },

  setPinVerified: (val: any) => set({ isPinVerified: val }),

  logout: async () => {
    try {
      await GoogleSignin.signOut();
      await SecureStore.deleteItemAsync("current_user");
      await SecureStore.deleteItemAsync("jwt_token");
      set({ user: null, isAuthenticated: false, isPinVerified: false });
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  // Called once when app launches — restores user from storage
  hydrate: async () => {
    try {
      const [userJson, token] = await Promise.all([
        SecureStore.getItemAsync("current_user"),
        SecureStore.getItemAsync("jwt_token"),
      ]);

      if (userJson && token) {
        const user = JSON.parse(userJson) as User;
        set({ user, isAuthenticated: true });
      }
    } catch (e) {
      console.error("Hydration failed:", e);
    } finally {
      set({ isHydrated: true }); // always mark as done even if failed
    }
  },

  setSavedFields: (emails, phones) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, savedEmails: emails, savedPhones: phones };
    SecureStore.setItemAsync("current_user", JSON.stringify(updated));
    set({ user: updated });
  },

  updateUser: async (fields) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...fields };
    await SecureStore.setItemAsync("current_user", JSON.stringify(updated));
    set({ user: updated });
  },
}));
