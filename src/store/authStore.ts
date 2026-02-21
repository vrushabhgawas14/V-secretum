import { create } from "zustand";
import { User } from "../types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isPinVerified: boolean;
  setUser: (user: User | null) => void;
  setPinVerified: (val: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set: any) => ({
  user: null,
  isAuthenticated: false,
  isPinVerified: false,
  setUser: (user: any) => set({ user, isAuthenticated: !!user }),
  setPinVerified: (val: any) => set({ isPinVerified: val }),
  logout: () =>
    set({ user: null, isAuthenticated: false, isPinVerified: false }),
}));
