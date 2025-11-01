import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define a interface para o estado do usuário
interface UserState {
  username: string; 
  pronouns: string;
  profileImageUrl: string;
  setUsername: (username: string) => void;
  setPronouns: (pronouns: string) => void;
  setProfileImageUrl: (url: string) => void;
  clearUser: () => void;
}

// Cria a store com Zustand
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({

      username: '',
      pronouns: '',
      profileImageUrl: '/AbstractUser.png',

      setUsername: (username: string) => set({ username }),
      setPronouns: (pronouns: string) => set({ pronouns }),
      setProfileImageUrl: (url: string) => set({ profileImageUrl: url }),
      clearUser: () => set({ 
        username: '', 
        pronouns: '', 
        profileImageUrl: '/AbstractUser.png' 
      }),
    }),
    {
      name: 'user-storage', // Nome da chave no localStorage
    }
  )
);