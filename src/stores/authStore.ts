import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
export type UserRole = 'manicurist' | 'client' | 'admin';
interface AuthState {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  login: (role: UserRole) => void;
  logout: () => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userRole: null,
      login: (role) => set({ isAuthenticated: true, userRole: role }),
      logout: () => set({ isAuthenticated: false, userRole: null }),
    }),
    {
      name: 'glo-auth-storage', // unique name for localStorage item
      storage: createJSONStorage(() => localStorage),
    }
  )
);