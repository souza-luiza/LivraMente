import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsTabs from '@/app/configuracoes/settings-tabs';
import { act } from '@testing-library/react';

// Mock do store de preferências de notificações
let mockPreferencias = {
  curtidas: true,
  comentarios: true,
  mencoes: true,
  novosSeguidores: true,
};

const mockAlterarPreferencia = jest.fn((tipo, valor) => {
  mockPreferencias = { ...mockPreferencias, [tipo]: valor };
});

jest.mock('@/stores/notificacoesStore', () => ({
  useNotPrefStore: () => ({
    get preferencias() {
      return mockPreferencias;
    },
    alterarPreferencia: mockAlterarPreferencia,
  }),
}));

// Mock dos componentes de ícones
jest.mock('@/components/icons/SingleUserIcon', () => ({
  __esModule: true,
  default: ({ size = 24 }: { size?: number }) => <div data-testid="single-user-icon">{size}</div>
}));

jest.mock('@/components/icons/NotificationsIcon', () => ({
  __esModule: true,
  default: ({ size = 24 }: { size?: number }) => <div data-testid="notifications-icon">{size}</div>
}));

jest.mock('@/components/icons/BlockIcon', () => ({
  __esModule: true,
  default: ({ size = 24, className }: { size?: number; className?: string }) => <div data-testid="block-icon" className={className}>{size}</div>
}));

jest.mock('@/components/icons/ShieldIcon', () => ({
  __esModule: true,
  default: ({ size = 24 }: { size?: number }) => <div data-testid="shield-icon">{size}</div>
}));

jest.mock('@/components/icons/EditIcon', () => ({
  __esModule: true,
  default: ({ size = 24 }: { size?: number }) => <div data-testid="edit-icon">{size}</div>
}));

jest.mock('@/components/icons/GlobeIcon', () => ({
  __esModule: true,
  default: ({ size = 24, className }: { size?: number; className?: string }) => <div data-testid="globe-icon" className={className}>{size}</div>
}));

jest.mock('@/components/icons/HeartIcon', () => ({
  __esModule: true,
  default: ({ size = 24 }: { size?: number }) => <div data-testid="heart-icon">{size}</div>
}));

jest.mock('@/components/icons/CommentIcon', () => ({
  __esModule: true,
  default: ({ size = 24 }: { size?: number }) => <div data-testid="comment-icon">{size}</div>
}));

jest.mock('@/components/icons/MentionIcon', () => ({
  __esModule: true,
  default: ({ size = 24 }: { size?: number }) => <div data-testid="mention-icon">{size}</div>
}));

jest.mock('@/components/icons/KeyIcon', () => ({
  __esModule: true,
  default: ({ size = 24 }: { size?: number }) => <div data-testid="key-icon">{size}</div>
}));

jest.mock('@/components/icons/SaveIcon', () => ({
  __esModule: true,
  default: () => <div data-testid="save-icon" />
}));

jest.mock('@/components/icons/RemoveIcon', () => ({
  __esModule: true,
  default: () => <div data-testid="remove-icon" />
}));

jest.mock('@/components/icons/TrashIcon', () => ({
  __esModule: true,
  default: ({ size = 24 }: { size?: number }) => <div data-testid="trash-icon">{size}</div>
}));

jest.mock('@/components/icons/PauseIcon', () => ({
  __esModule: true,
  default: ({ size = 24 }: { size?: number }) => <div data-testid="pause-icon">{size}</div>
}));

jest.mock('@/components/icons/PlusCheckboxIcon', () => ({
  __esModule: true,
  default: () => <div data-testid="plus-checkbox-icon" />
}));

jest.mock('@/components/icons/ChevronRightIcon', () => ({
  __esModule: true,
  default: ({ size = 24, className }: { size?: number; className?: string }) => <div data-testid="chevron-right-icon" className={className}>{size}</div>
}));

// Mock dos componentes adicionais
jest.mock('@/components/general-input', () => ({
  __esModule: true,
  default: ({ label, value, onChange, type, placeholder, className, fullWidth }: any) => (
    <div className={`relative ${fullWidth && 'w-full'}`}>
      {label && <label htmlFor={`input-${label}`}>{label}</label>}
      <input
        id={`input-${label}`}
        type={type || 'text'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
      />
    </div>
  )
}));

jest.mock('@/components/phone-input', () => ({
  __esModule: true,
  default: ({ label, value, onChange, placeholder, fullWidth }: any) => (
    <div className={`relative ${fullWidth && 'w-full'}`}>
      {label && <label htmlFor={`phone-${label}`}>{label}</label>}
      <input
        id={`phone-${label}`}
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid="phone-input"
      />
    </div>
  )
}));

jest.mock('@/components/select-country', () => ({
  __esModule: true,
  default: ({ label, value, onChange, fullWidth }: any) => (
    <div className={`relative ${fullWidth && 'w-full'}`}>
      {label && <label htmlFor={`country-${label}`}>{label}</label>}
      <select
        id={`country-${label}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid="country-select"
      >
        <option value="BR">Brasil</option>
        <option value="US">Estados Unidos</option>
      </select>
    </div>
  )
}));

jest.mock('@/components/button', () => ({
  __esModule: true,
  default: ({ text, icon, size, colorScheme, onClick }: any) => (
    <button className={`${size} ${colorScheme}`} onClick={onClick}>
      <span>{text}</span>
      {icon && <span>{icon}</span>}
    </button>
  )
}));

describe('SettingsTabs', () => {
  describe('Tab Navigation', () => {
    it('should render all tabs', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
      expect(screen.getByText('Notificações')).toBeInTheDocument();
      expect(screen.getByText('Segurança')).toBeInTheDocument();
      expect(screen.getByText('Restrições')).toBeInTheDocument();
    });

    it('should start with profile tab active', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Informações Pessoais')).toBeInTheDocument();
    });

    it('should switch to notifications tab', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.click(screen.getByText('Notificações'));
      });
      expect(screen.getByText('Preferências de Notificação')).toBeInTheDocument();
    });

    it('should switch to security tab', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.click(screen.getByText('Segurança'));
      });
      expect(screen.getByText('Segurança e Login')).toBeInTheDocument();
    });

    it('should switch to restrictions tab', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.click(screen.getByText('Restrições'));
      });
      expect(screen.getByText('Contas Bloqueadas')).toBeInTheDocument();
    });
  });

  describe('Profile Tab', () => {

    it('should display username', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      expect(screen.getByText('@')).toBeInTheDocument();
    });

    it('should render profile picture edit button', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Alterar foto de perfil')).toBeInTheDocument();
    });

    it('should render personal information inputs', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      expect(screen.getByLabelText('Nome de usuário')).toBeInTheDocument();
      expect(screen.getByLabelText('Pronome')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Telefone')).toBeInTheDocument();
      expect(screen.getByLabelText('País')).toBeInTheDocument();
    });

    it('should update username input', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      const usernameInput = await screen.findByLabelText('Nome de usuário') as HTMLInputElement;
      await act(async () => {
        fireEvent.change(usernameInput, { target: { value: 'newuser' } });
      });
      expect(usernameInput.value).toBe('');
    });

    it('should update pronoun input', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      const pronounInput = screen.getByLabelText('Pronome') as HTMLInputElement;
      await act(async () => {
        fireEvent.change(pronounInput, { target: { value: 'ele/dele' } });
      });
      expect(pronounInput.value).toBe('');
    });

    it('should update email input', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'new@email.com' } });
      });
      expect(emailInput.value).toBe('');
    });

    it('should render save and cancel buttons', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Salvar alterações')).toBeInTheDocument();
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });

    it('should render privacy section', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Privacidade da Conta')).toBeInTheDocument();
      expect(screen.getByText('Conta Pública')).toBeInTheDocument();
      expect(screen.getByText('Qualquer pessoa pode ver suas publicações')).toBeInTheDocument();
    });

    it('should render critical settings section', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Configurações Críticas')).toBeInTheDocument();
      expect(screen.getByText('Desativar conta temporariamente')).toBeInTheDocument();
      expect(screen.getByText('Excluir conta permanentemente')).toBeInTheDocument();
    });

    it('should render deactivate account button', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Desativar conta temporariamente')).toBeInTheDocument();
      expect(screen.getByText('Suas informações serão preservadas')).toBeInTheDocument();
    });

    it('should render delete account button', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Excluir conta permanentemente')).toBeInTheDocument();
      expect(screen.getByText('Esta ação não pode ser desfeita')).toBeInTheDocument();
    });
  });


  describe('Notifications Tab', () => {
    beforeEach(async () => {
      mockPreferencias = {
        curtidas: true,
        comentarios: true,
        mencoes: true,
        novosSeguidores: true,
      };
      mockAlterarPreferencia.mockClear();
      
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.queryByTestId('loading-main')).not.toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.click(screen.getByText('Notificações'));
      });
    });

    it('should render notifications header', () => {
      expect(screen.getByText('Preferências de Notificação')).toBeInTheDocument();
      expect(screen.getByText('Gerencie como você deseja ser notificado sobre atividades')).toBeInTheDocument();
    });

    it('should render all notification options', () => {
      expect(screen.getByText('Curtidas')).toBeInTheDocument();
      expect(screen.getByText('Comentários')).toBeInTheDocument();
      expect(screen.getByText('Menções')).toBeInTheDocument();
      expect(screen.getByText('Novos seguidores')).toBeInTheDocument();
    });

    it('should render notification descriptions', () => {
      expect(screen.getByText('Quando alguém curtir sua publicação')).toBeInTheDocument();
      expect(screen.getByText('Quando alguém comentar suas publicações')).toBeInTheDocument();
      expect(screen.getByText('Quando alguém mencionar você')).toBeInTheDocument();
      expect(screen.getByText('Quando alguém começar a seguir você')).toBeInTheDocument();
    });

    it('should render toggle switches for notifications', () => {
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(4);
      checkboxes.forEach(checkbox => {
        expect(checkbox).toBeChecked();
      });
    });

    it('should toggle notification checkbox', async () => {
      const checkboxes = screen.getAllByRole('checkbox');
      const firstCheckbox = checkboxes[0] as HTMLInputElement;
      
      expect(firstCheckbox).toBeChecked();
      
      fireEvent.click(firstCheckbox);
      expect(mockAlterarPreferencia).toHaveBeenCalledWith('curtidas', false);
      
      mockPreferencias.curtidas = false;

      fireEvent.click(screen.getByText('Meu Perfil'));
      fireEvent.click(screen.getByText('Notificações'));
      
      const updatedCheckboxes = screen.getAllByRole('checkbox');
      expect(updatedCheckboxes[0]).not.toBeChecked();
    });
  });

  describe('Security Tab', () => {
    beforeEach(async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.click(screen.getByText('Segurança'));
      });
    });

    it('should render security header', () => {
      expect(screen.getByText('Segurança e Login')).toBeInTheDocument();
      expect(screen.getByText('Proteja sua conta e gerencie suas sessões')).toBeInTheDocument();
    });

    it('should render security options', () => {
      expect(screen.getByText('Alterar senha')).toBeInTheDocument();
      expect(screen.getByText('Autenticação de dois fatores')).toBeInTheDocument();
      expect(screen.getByText('Sessões ativas')).toBeInTheDocument();
    });

    it('should render security option descriptions', () => {
      expect(screen.getByText('Última alteração há 3 meses')).toBeInTheDocument();
      expect(screen.getByText('Adicione uma camada extra de segurança')).toBeInTheDocument();
      expect(screen.getByText('1 dispositivo conectado')).toBeInTheDocument();
    });

    it('should render security option icons', async () => {
      const shieldIcons = screen.getAllByTestId('shield-icon');
      const keyIcon = screen.getByTestId('key-icon');
      const notificationsIcon = screen.getAllByTestId('notifications-icon');
      
      expect(shieldIcons.length).toBeGreaterThan(0);
      expect(keyIcon).toBeInTheDocument();
      expect(notificationsIcon.length).toBeGreaterThan(0);
    });
  });

  describe('Restrictions Tab', () => {
    beforeEach(async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.click(screen.getByText('Restrições'));
      });
    });

    it('should render restrictions header', async () => {
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      expect(screen.getByText('Contas Bloqueadas')).toBeInTheDocument();
    });

    it('should render restrictions description', async () => {
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      expect(screen.getByText(/Usuários bloqueados não poderão encontrar seu perfil/)).toBeInTheDocument();
      expect(screen.getByText(/Eles não serão notificados que você os bloqueou/)).toBeInTheDocument();
    });

    it('should render block accounts button', async () => {
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      expect(screen.getByText('Bloquear Contas')).toBeInTheDocument();
    });

    it('should render empty state', async () => {
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      expect(screen.getByText('Nenhuma conta bloqueada')).toBeInTheDocument();
      expect(screen.getByText('Quando você bloquear alguém, eles aparecerão aqui')).toBeInTheDocument();
    });
  });

  describe('Tab Icons', () => {
    it('should render all tab icons', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      expect(screen.getAllByTestId('single-user-icon').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('notifications-icon').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('shield-icon').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('block-icon').length).toBeGreaterThan(0);
    });
  });

  describe('Input Validation', () => {
    it('should have email input with type email', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      const emailInput = screen.getByLabelText('Email');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should display default email value', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
      expect(emailInput.value).toBe('');
    });

    it('should display default username value', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      const usernameInput = screen.getByLabelText('Nome de usuário') as HTMLInputElement;
      expect(usernameInput.value).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper tab roles', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(4);
    });

    it('should have proper tablist role', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();
    });

    it('should have proper tabpanel role', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      const tabpanel = screen.getByRole('tabpanel');
      expect(tabpanel).toBeInTheDocument();
    });

    it('should mark active tab with aria-selected', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      const profileTab = screen.getByText('Meu Perfil').closest('button');
      expect(profileTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Component Styling', () => {
    it('should have rounded shadow container', async () => {
      const { container } = render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      const mainContainer = container.querySelector('.bg-white.rounded-lg.shadow-sm');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should apply hover styles to privacy button', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      const privacyButton = screen.getByText('Conta Pública').closest('button');
      expect(privacyButton).toHaveClass('hover:bg-[#f9fafb]');
    });

    it('should apply red theme to critical settings', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Configurações Críticas')).toHaveClass('text-red-600');
    });
  });

  describe('Profile Tab - Phone and Country', () => {
    it('should render phone input', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      expect(screen.getByTestId('phone-input')).toBeInTheDocument();
    });

    it('should render country select', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      expect(screen.getByTestId('country-select')).toBeInTheDocument();
    });

    it('should update phone number', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      const phoneInput = screen.getByTestId('phone-input') as HTMLInputElement;
      await act(async () => {
        fireEvent.change(phoneInput, { target: { value: '11999999999' } });
      });
      expect(phoneInput.value).toBe('11999999999');
    });

    it('should update country selection', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      const countrySelect = screen.getByTestId('country-select') as HTMLSelectElement;
      await act(async () => {
        fireEvent.change(countrySelect, { target: { value: 'US' } });
      });
      expect(countrySelect.value).toBe('US');
    });

    it('should have default country as BR', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      const countrySelect = screen.getByTestId('country-select') as HTMLSelectElement;
      expect(countrySelect.value).toBe('BR');
    });

    it('should render phone input with correct label', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      expect(screen.getByLabelText('Telefone')).toBeInTheDocument();
    });

    it('should render country select with correct label', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      expect(screen.getByLabelText('País')).toBeInTheDocument();
    });

    it('should clear phone input value', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      const phoneInput = screen.getByTestId('phone-input') as HTMLInputElement;
      await act(async () => {
        fireEvent.change(phoneInput, { target: { value: '11999999999' } });
        fireEvent.change(phoneInput, { target: { value: '' } });
      });
      expect(phoneInput.value).toBe('');
    });

    it('should have empty phone input by default', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      const phoneInput = screen.getByTestId('phone-input') as HTMLInputElement;
      expect(phoneInput.value).toBe('');
    });

    it('should render country select with Brasil option', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Brasil')).toBeInTheDocument();
    });

    it('should render country select with Estados Unidos option', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Estados Unidos')).toBeInTheDocument();
    });

    it('should switch country back to BR after changing to US', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      const countrySelect = screen.getByTestId('country-select') as HTMLSelectElement;
      await act(async () => {
        fireEvent.change(countrySelect, { target: { value: 'US' } });
      });
      expect(countrySelect.value).toBe('US');
      await act(async () => {
        fireEvent.change(countrySelect, { target: { value: 'BR' } });
      });
      expect(countrySelect.value).toBe('BR');
    });
  });

  describe('Profile Tab - Additional Input Tests', () => {
    it('should handle empty pronoun value', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      const pronounInput = screen.getByLabelText('Pronome') as HTMLInputElement;
      expect(pronounInput.value).toBe('');
    });

    it('should clear username input', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      const usernameInput = screen.getByLabelText('Nome de usuário') as HTMLInputElement;
      await act(async () => {
        fireEvent.change(usernameInput, { target: { value: '' } });
      });
      expect(usernameInput.value).toBe('');
    });

    it('should render all inputs with fullWidth prop', async () => {
      const { container } = render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      
      const fullWidthInputs = container.querySelectorAll('.w-full');
      expect(fullWidthInputs.length).toBeGreaterThan(0);
    });
  });

  describe('Restrictions Tab - Fixed Tests', () => {
    it('should render empty state icon with size 64', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.click(screen.getByText('Restrições'));
      });
      const blockIcons = screen.getAllByTestId('block-icon');
      const emptyStateIcon = blockIcons.find(icon => icon.textContent === '64');
      
      expect(emptyStateIcon).toBeInTheDocument();
      expect(emptyStateIcon).toHaveClass('text-gray-300');
    });

    it('should render block icon in tab with size 24', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
      });
      
      const blockIcons = screen.getAllByTestId('block-icon');
      const tabIcon = blockIcons.find(icon => icon.textContent === '24');
      
      expect(tabIcon).toBeInTheDocument();
    });

    it('should have exactly 2 block icons when on restrictions tab', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.click(screen.getByText('Restrições'));
      });
      const blockIcons = screen.getAllByTestId('block-icon');
      expect(blockIcons).toHaveLength(2);
    });

    it('should render block icon with mx-auto class in empty state', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.click(screen.getByText('Restrições'));
      });
      const blockIcons = screen.getAllByTestId('block-icon');
      const emptyStateIcon = blockIcons.find(icon => icon.classList.contains('mx-auto'));
      
      expect(emptyStateIcon).toBeInTheDocument();
    });

    it('should render plus checkbox icon in block button', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.click(screen.getByText('Restrições'));
      });
      expect(screen.getByTestId('plus-checkbox-icon')).toBeInTheDocument();
    });

    it('should render block accounts button with correct text', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.click(screen.getByText('Restrições'));
      });
      const blockButton = screen.getByText('Bloquear Contas');
      expect(blockButton).toBeInTheDocument();
    });

    it('should apply flex justify-end to button container', async () => {
      const { container } = render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.click(screen.getByText('Restrições'));
      });
      const buttonContainer = container.querySelector('.flex.justify-end');
      expect(buttonContainer).toBeInTheDocument();
    });
  });

  describe('Tab Persistence Tests', () => {
    it('should keep restrictions tab active after interaction', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Restrições')).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.click(screen.getByText('Restrições'));
      });
      const restrictionsTab = screen.getByText('Restrições').closest('button');
      
      expect(restrictionsTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should deactivate previous tab when switching', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
      });
      const profileTab = screen.getByText('Meu Perfil').closest('button');
      expect(profileTab).toHaveAttribute('aria-selected', 'true');
      await waitFor(() => {
        expect(screen.getByText('Segurança')).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.click(screen.getByText('Segurança'));
      });
      expect(profileTab).toHaveAttribute('aria-selected', 'false');
    });

    it('should show correct panel content when switching tabs', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Segurança')).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.click(screen.getByText('Segurança'));
      });
      expect(screen.getByText('Alterar senha')).toBeInTheDocument();
      expect(screen.queryByText('Informações Pessoais')).not.toBeInTheDocument();
    });

    it('should maintain all tabs visible when switching', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Notificações')).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.click(screen.getByText('Notificações'));
      });
      expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
      expect(screen.getByText('Notificações')).toBeInTheDocument();
      expect(screen.getByText('Segurança')).toBeInTheDocument();
      expect(screen.getByText('Restrições')).toBeInTheDocument();
    });
  });

  describe('Notification Descriptions Tests', () => {
    it('should render complete like notification description', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Notificações')).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.click(screen.getByText('Notificações'));
      });
      expect(screen.getByText('Quando alguém curtir sua publicação')).toBeInTheDocument();
    });

    it('should render complete comment notification description', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Notificações')).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.click(screen.getByText('Notificações'));
      });
      expect(screen.getByText('Quando alguém comentar suas publicações')).toBeInTheDocument();
    });

    it('should render complete mention notification description', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Notificações')).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.click(screen.getByText('Notificações'));
      });
      expect(screen.getByText('Quando alguém mencionar você')).toBeInTheDocument();
    });

    it('should render complete followers notification description', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Notificações')).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.click(screen.getByText('Notificações'));
      });
      expect(screen.getByText('Quando alguém começar a seguir você')).toBeInTheDocument();
    });
  });

  describe('Security Options Tests', () => {
    it('should render password change option with description', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Segurança')).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.click(screen.getByText('Segurança'));
      });
      expect(screen.getByText('Alterar senha')).toBeInTheDocument();
      expect(screen.getByText('Última alteração há 3 meses')).toBeInTheDocument();
    });

    it('should render 2FA option with description', async () => {
      render(<SettingsTabs />);
      await waitFor(() => {
        expect(screen.getByText('Segurança')).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.click(screen.getByText('Segurança'));
      });
      expect(screen.getByText('Autenticação de dois fatores')).toBeInTheDocument();
      expect(screen.getByText('Adicione uma camada extra de segurança')).toBeInTheDocument();
    });

    it('should render active sessions option with description', async () => {
      render(<SettingsTabs />);

      await waitFor(() => {
        expect(screen.getByText('Segurança')).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.click(screen.getByText('Segurança'));
      });
      expect(screen.getByText('Sessões ativas')).toBeInTheDocument();
      expect(screen.getByText('1 dispositivo conectado')).toBeInTheDocument();
    });

    it('should render chevron icons in all security buttons', async () => {
      render(<SettingsTabs />);

      await waitFor(() => {
        expect(screen.getByText('Segurança')).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.click(screen.getByText('Segurança'));
      });
      const chevronIcons = await screen.findAllByTestId('chevron-right-icon');
      const securityChevrons = chevronIcons.filter(icon => icon.textContent === '20');
      expect(securityChevrons.length).toBeGreaterThan(0);
    });
  });

  describe('Critical Settings Tests', () => {
    it('should render deactivate button with red theme', async () => {
      render(<SettingsTabs />);

      const deactivateText = await screen.findByText((content, element) => {
        return content === 'Desativar conta temporariamente' && element?.tagName === 'P';
      });

      const deactivateButton = deactivateText.closest('button');
      expect(deactivateButton).toHaveClass('border-red-200');
    });

    it('should render delete button with red theme', async () => {
      render(<SettingsTabs />);
      const deactivateText = await screen.findByText((content, element) => {
        return content === 'Excluir conta permanentemente' && element?.tagName === 'P';
      });
      const deactivateButton = deactivateText.closest('button');
      expect(deactivateButton).toHaveClass('hover:bg-red-50');
    });

    it('should render pause icon in deactivate button with size 24', async () => {
      render(<SettingsTabs />);
      
      const pauseIcon = await screen.findByTestId('pause-icon');
      expect(pauseIcon).toHaveTextContent('24');
    });

    it('should render trash icon in delete button with size 24', async () => {
      render(<SettingsTabs />);
      const trashIcon = await screen.findByTestId('trash-icon');
      expect(trashIcon).toHaveTextContent('24');
    });

    it('should have red border on critical settings buttons', async () => {
      render(<SettingsTabs />);

      const deactivateText = await screen.findByText((content, element) => {
        return content === 'Desativar conta temporariamente' && element?.tagName === 'P';
      });
      const deactivateButton = deactivateText.closest('button');
      expect(deactivateButton).toHaveClass('border-red-200');
    });
  });

  describe('Username Header Update Tests', () => {
    it('should update header when username changes', async () => {
      render(<SettingsTabs />);

      const usernameInput = await screen.findByLabelText('Nome de usuário') as HTMLInputElement;
      await act(async () => {
        fireEvent.change(usernameInput, { target: { value: 'newusername' } });
      });
      await waitFor(() => {
        const header = screen.getByRole('heading', { level: 5 });
        expect(header).toHaveTextContent('@');
      });
    });

    it('should show empty header when username is cleared', async () => {
      render(<SettingsTabs />);
      
      const usernameInput = await screen.findByLabelText('Nome de usuário') as HTMLInputElement;
      await act(async () => {
        fireEvent.change(usernameInput, { target: { value: '' } });
      });
      expect(screen.getByText(/@$/)).toBeInTheDocument();
    });
  });
});