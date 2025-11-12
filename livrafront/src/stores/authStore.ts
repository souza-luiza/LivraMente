import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  userId: string | null;
  setAuth: ( username: string, userId: string) => void;
  clearAuth: () => void;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      username: null,
      userId: null,

      setAuth: ( username: string, userId: string) => {
        set({ isAuthenticated: true, username, userId });
      },

      clearAuth: () => {
        set({ isAuthenticated: false, username: null, userId: null });
      },

      checkAuth: async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify`,
            {
              credentials: 'include',
            }
          );
          const isValid = response.ok;
          if (!isValid) {
            set({ isAuthenticated: false, username: null, userId: null });
          }
          return isValid;
        } catch {
          set({ isAuthenticated: false, username: null, userId: null });
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        username: state.username,
        userId: state.userId,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
