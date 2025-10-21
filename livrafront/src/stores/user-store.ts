import { create } from 'zustand';

// Define a interface para o estado do usuário
interface UserState {
  username: string; 
  pronouns: string;
  profileImageUrl: string;
  setUsername: (name: string) => void;
  setPronouns: (pronouns: string) => void;
  setProfileImageUrl: (url: string) => void;
}

// Cria a store com Zustand
export const useUserStore = create<UserState>((set) => ({

  username: '@gatanoturna',
  pronouns: 'ela/dela',
  profileImageUrl: '/Readlist.svg', //imagem para testes

  setUsername: (name: string) => set({ username: name }),
  setPronouns: (pronouns: string) => set({ pronouns }),
  setProfileImageUrl: (url: string) => set({ profileImageUrl: url }),
}));