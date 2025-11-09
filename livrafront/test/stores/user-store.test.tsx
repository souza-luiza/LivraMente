import { useUserStore } from '@/stores/user-store';
import { act } from '@testing-library/react';

// Pega o estado inicial para podermos resetar a store antes de cada teste
const initialState = useUserStore.getState();

describe('useUserStore', () => {

  beforeEach(() => {
    useUserStore.setState(initialState);
  });

  it('deve ter o estado inicial correto', () => {
    const { username, pronouns } = useUserStore.getState();
    expect(username).toBe('@gatanoturna');
    expect(pronouns).toBe('ela/dela');
  });

  it('deve atualizar o username corretamente com setUsername', () => {
    // A função 'act' garante que a atualização de estado seja processada
    act(() => {
      useUserStore.getState().setUsername('novo_nome');
    });
    
    const { username } = useUserStore.getState();
    expect(username).toBe('novo_nome');
  });

  it('deve atualizar os pronomes corretamente com setPronouns', () => {
    act(() => {
      useUserStore.getState().setPronouns('ele/dele');
    });

    const { pronouns } = useUserStore.getState();
    expect(pronouns).toBe('ele/dele');
  });
});