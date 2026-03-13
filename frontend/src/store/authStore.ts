import { create } from 'zustand';

export interface User {
  _id: string;
  email: string;
  role: 'ADMIN' | 'PACKAGING' | 'SHIPMENT' | 'ORDER_PLACEMENT' | 'BILLING';
  token: string;
}

interface AuthState {
  user: User | null;
  hydrated: boolean; // to prevent hydration mismatch errors in Next.js
  setUser: (user: User) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  hydrated: false,
  setUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('workflow_user', JSON.stringify(user));
    }
    set({ user });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('workflow_user');
    }
    set({ user: null });
  },
  setHydrated: () => set({ hydrated: true }),
}));
