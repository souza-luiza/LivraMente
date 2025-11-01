import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  username: string | null;
  userId: string | null;
  setAuth: (token: string, username: string, userId: string) => void;
  clearAuth: () => void;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      username: null,
      userId: null,

      setAuth: (token: string, username: string, userId: string) => {
        set({ isAuthenticated: true, token, username, userId });
      },

      clearAuth: () => {
        set({ isAuthenticated: false, token: null, username: null, userId: null });
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
            set({ isAuthenticated: false, token: null, username: null, userId: null });
          }
          return isValid;
        } catch {
          set({ isAuthenticated: false, token: null, username: null, userId: null });
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        username: state.username,
        userId: state.userId,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
