import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsTabs from '@/app/settings/settings-tabs';

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

jest.mock('@/components/profile-icon', () => ({
  __esModule: true,
  default: ({ size, showProgress, className }: { size?: number; showProgress?: boolean; className?: string }) => (
    <div data-testid="profile-icon" data-size={size} data-show-progress={showProgress} className={className} />
  )
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
    it('should render all tabs', () => {
      render(<SettingsTabs />);
      
      expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
      expect(screen.getByText('Notificações')).toBeInTheDocument();
      expect(screen.getByText('Segurança')).toBeInTheDocument();
      expect(screen.getByText('Restrições')).toBeInTheDocument();
    });

    it('should start with profile tab active', () => {
      render(<SettingsTabs />);
      
      expect(screen.getByText('Informações Pessoais')).toBeInTheDocument();
    });

    it('should switch to notifications tab', () => {
      render(<SettingsTabs />);
      
      fireEvent.click(screen.getByText('Notificações'));
      
      expect(screen.getByText('Preferências de Notificação')).toBeInTheDocument();
    });

    it('should switch to security tab', () => {
      render(<SettingsTabs />);
      
      fireEvent.click(screen.getByText('Segurança'));
      
      expect(screen.getByText('Segurança e Login')).toBeInTheDocument();
    });

    it('should switch to restrictions tab', () => {
      render(<SettingsTabs />);
      
      fireEvent.click(screen.getByText('Restrições'));
      
      expect(screen.getByText('Contas Bloqueadas')).toBeInTheDocument();
    });
  });

  describe('Profile Tab', () => {
    it('should render profile icon with correct props', () => {
      render(<SettingsTabs />);
      
      const profileIcon = screen.getByTestId('profile-icon');
      expect(profileIcon).toHaveAttribute('data-size', '100');
      expect(profileIcon).toHaveAttribute('data-show-progress', 'false');
    });

    it('should display username', () => {
      render(<SettingsTabs />);
      
      expect(screen.getByText('@user')).toBeInTheDocument();
    });

    it('should render profile picture edit button', () => {
      render(<SettingsTabs />);
      
      expect(screen.getByText('Alterar foto de perfil')).toBeInTheDocument();
    });

    it('should render personal information inputs', () => {
      render(<SettingsTabs />);
      
      expect(screen.getByLabelText('Nome de usuário')).toBeInTheDocument();
      expect(screen.getByLabelText('Pronome')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Telefone')).toBeInTheDocument();
      expect(screen.getByLabelText('País')).toBeInTheDocument();
    });

    it('should update username input', () => {
      render(<SettingsTabs />);
      
      const usernameInput = screen.getByLabelText('Nome de usuário') as HTMLInputElement;
      fireEvent.change(usernameInput, { target: { value: 'newuser' } });
      
      expect(usernameInput.value).toBe('newuser');
    });

    it('should update pronoun input', () => {
      render(<SettingsTabs />);
      
      const pronounInput = screen.getByLabelText('Pronome') as HTMLInputElement;
      fireEvent.change(pronounInput, { target: { value: 'ele/dele' } });
      
      expect(pronounInput.value).toBe('ele/dele');
    });

    it('should update email input', () => {
      render(<SettingsTabs />);
      
      const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'new@email.com' } });
      
      expect(emailInput.value).toBe('new@email.com');
    });

    it('should render save and cancel buttons', () => {
      render(<SettingsTabs />);
      
      expect(screen.getByText('Salvar alterações')).toBeInTheDocument();
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });

    it('should render privacy section', () => {
      render(<SettingsTabs />);
      
      expect(screen.getByText('Privacidade da Conta')).toBeInTheDocument();
      expect(screen.getByText('Conta Pública')).toBeInTheDocument();
      expect(screen.getByText('Qualquer pessoa pode ver suas publicações')).toBeInTheDocument();
    });

    it('should render critical settings section', () => {
      render(<SettingsTabs />);
      
      expect(screen.getByText('Configurações Críticas')).toBeInTheDocument();
      expect(screen.getByText('Desativar conta temporariamente')).toBeInTheDocument();
      expect(screen.getByText('Excluir conta permanentemente')).toBeInTheDocument();
    });

    it('should render deactivate account button', () => {
      render(<SettingsTabs />);
      
      expect(screen.getByText('Desativar conta temporariamente')).toBeInTheDocument();
      expect(screen.getByText('Suas informações serão preservadas')).toBeInTheDocument();
    });

    it('should render delete account button', () => {
      render(<SettingsTabs />);
      
      expect(screen.getByText('Excluir conta permanentemente')).toBeInTheDocument();
      expect(screen.getByText('Esta ação não pode ser desfeita')).toBeInTheDocument();
    });
  });

  describe('Notifications Tab', () => {
    beforeEach(() => {
      render(<SettingsTabs />);
      fireEvent.click(screen.getByText('Notificações'));
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

    it('should toggle notification checkbox', () => {
      const checkboxes = screen.getAllByRole('checkbox');
      const firstCheckbox = checkboxes[0] as HTMLInputElement;
      
      fireEvent.click(firstCheckbox);
      expect(firstCheckbox).not.toBeChecked();
      
      fireEvent.click(firstCheckbox);
      expect(firstCheckbox).toBeChecked();
    });
  });

  describe('Security Tab', () => {
    beforeEach(() => {
      render(<SettingsTabs />);
      fireEvent.click(screen.getByText('Segurança'));
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

    it('should render security option icons', () => {
      const shieldIcons = screen.getAllByTestId('shield-icon');
      const keyIcon = screen.getByTestId('key-icon');
      const notificationsIcon = screen.getAllByTestId('notifications-icon');
      
      expect(shieldIcons.length).toBeGreaterThan(0);
      expect(keyIcon).toBeInTheDocument();
      expect(notificationsIcon.length).toBeGreaterThan(0);
    });
  });

  describe('Restrictions Tab', () => {
    beforeEach(() => {
      render(<SettingsTabs />);
      fireEvent.click(screen.getByText('Restrições'));
    });

    it('should render restrictions header', () => {
      expect(screen.getByText('Contas Bloqueadas')).toBeInTheDocument();
    });

    it('should render restrictions description', () => {
      expect(screen.getByText(/Usuários bloqueados não poderão encontrar seu perfil/)).toBeInTheDocument();
      expect(screen.getByText(/Eles não serão notificados que você os bloqueou/)).toBeInTheDocument();
    });

    it('should render block accounts button', () => {
      expect(screen.getByText('Bloquear Contas')).toBeInTheDocument();
    });

    it('should render empty state', () => {
      expect(screen.getByText('Nenhuma conta bloqueada')).toBeInTheDocument();
      expect(screen.getByText('Quando você bloquear alguém, eles aparecerão aqui')).toBeInTheDocument();
    });
  });

  describe('Tab Icons', () => {
    it('should render all tab icons', () => {
      render(<SettingsTabs />);
      
      expect(screen.getAllByTestId('single-user-icon').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('notifications-icon').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('shield-icon').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('block-icon').length).toBeGreaterThan(0);
    });
  });

  describe('Input Validation', () => {
    it('should have email input with type email', () => {
      render(<SettingsTabs />);
      
      const emailInput = screen.getByLabelText('Email');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should display default email value', () => {
      render(<SettingsTabs />);
      
      const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
      expect(emailInput.value).toBe('user@example.com');
    });

    it('should display default username value', () => {
      render(<SettingsTabs />);
      
      const usernameInput = screen.getByLabelText('Nome de usuário') as HTMLInputElement;
      expect(usernameInput.value).toBe('user');
    });
  });

  describe('Accessibility', () => {
    it('should have proper tab roles', () => {
      render(<SettingsTabs />);
      
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(4);
    });

    it('should have proper tablist role', () => {
      render(<SettingsTabs />);
      
      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();
    });

    it('should have proper tabpanel role', () => {
      render(<SettingsTabs />);
      
      const tabpanel = screen.getByRole('tabpanel');
      expect(tabpanel).toBeInTheDocument();
    });

    it('should mark active tab with aria-selected', () => {
      render(<SettingsTabs />);
      
      const profileTab = screen.getByText('Meu Perfil').closest('button');
      expect(profileTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Component Styling', () => {
    it('should have rounded shadow container', () => {
      const { container } = render(<SettingsTabs />);
      
      const mainContainer = container.querySelector('.bg-white.rounded-lg.shadow-sm');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should apply hover styles to privacy button', () => {
      render(<SettingsTabs />);
      
      const privacyButton = screen.getByText('Conta Pública').closest('button');
      expect(privacyButton).toHaveClass('hover:bg-[#f9fafb]');
    });

    it('should apply red theme to critical settings', () => {
      render(<SettingsTabs />);
      
      expect(screen.getByText('Configurações Críticas')).toHaveClass('text-red-600');
    });
  });

  describe('Profile Tab - Phone and Country', () => {
    it('should render phone input', () => {
      render(<SettingsTabs />);
      
      expect(screen.getByTestId('phone-input')).toBeInTheDocument();
    });

    it('should render country select', () => {
      render(<SettingsTabs />);
      
      expect(screen.getByTestId('country-select')).toBeInTheDocument();
    });

    it('should update phone number', () => {
      render(<SettingsTabs />);
      
      const phoneInput = screen.getByTestId('phone-input') as HTMLInputElement;
      fireEvent.change(phoneInput, { target: { value: '11999999999' } });
      
      expect(phoneInput.value).toBe('11999999999');
    });

    it('should update country selection', () => {
      render(<SettingsTabs />);
      
      const countrySelect = screen.getByTestId('country-select') as HTMLSelectElement;
      fireEvent.change(countrySelect, { target: { value: 'US' } });
      
      expect(countrySelect.value).toBe('US');
    });

    it('should have default country as BR', () => {
      render(<SettingsTabs />);
      
      const countrySelect = screen.getByTestId('country-select') as HTMLSelectElement;
      expect(countrySelect.value).toBe('BR');
    });

    it('should render phone input with correct label', () => {
      render(<SettingsTabs />);
      
      expect(screen.getByLabelText('Telefone')).toBeInTheDocument();
    });

    it('should render country select with correct label', () => {
      render(<SettingsTabs />);
      
      expect(screen.getByLabelText('País')).toBeInTheDocument();
    });

    it('should clear phone input value', () => {
      render(<SettingsTabs />);
      
      const phoneInput = screen.getByTestId('phone-input') as HTMLInputElement;
      fireEvent.change(phoneInput, { target: { value: '11999999999' } });
      fireEvent.change(phoneInput, { target: { value: '' } });
      
      expect(phoneInput.value).toBe('');
    });

    it('should have empty phone input by default', () => {
      render(<SettingsTabs />);
      
      const phoneInput = screen.getByTestId('phone-input') as HTMLInputElement;
      expect(phoneInput.value).toBe('');
    });

    it('should render country select with Brasil option', () => {
      render(<SettingsTabs />);
      
      expect(screen.getByText('Brasil')).toBeInTheDocument();
    });

    it('should render country select with Estados Unidos option', () => {
      render(<SettingsTabs />);
      
      expect(screen.getByText('Estados Unidos')).toBeInTheDocument();
    });

    it('should switch country back to BR after changing to US', () => {
      render(<SettingsTabs />);
      
      const countrySelect = screen.getByTestId('country-select') as HTMLSelectElement;
      fireEvent.change(countrySelect, { target: { value: 'US' } });
      expect(countrySelect.value).toBe('US');
      
      fireEvent.change(countrySelect, { target: { value: 'BR' } });
      expect(countrySelect.value).toBe('BR');
    });
  });

  describe('Profile Tab - Additional Input Tests', () => {
    it('should handle empty pronoun value', () => {
      render(<SettingsTabs />);
      
      const pronounInput = screen.getByLabelText('Pronome') as HTMLInputElement;
      expect(pronounInput.value).toBe('');
    });

    it('should clear username input', () => {
      render(<SettingsTabs />);
      
      const usernameInput = screen.getByLabelText('Nome de usuário') as HTMLInputElement;
      fireEvent.change(usernameInput, { target: { value: '' } });
      
      expect(usernameInput.value).toBe('');
    });

    it('should update multiple inputs sequentially', () => {
      render(<SettingsTabs />);
      
      const usernameInput = screen.getByLabelText('Nome de usuário') as HTMLInputElement;
      const pronounInput = screen.getByLabelText('Pronome') as HTMLInputElement;
      const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
      
      fireEvent.change(usernameInput, { target: { value: 'johndoe' } });
      fireEvent.change(pronounInput, { target: { value: 'ele/dele' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      
      expect(usernameInput.value).toBe('johndoe');
      expect(pronounInput.value).toBe('ele/dele');
      expect(emailInput.value).toBe('john@example.com');
    });

    it('should handle special characters in username', () => {
      render(<SettingsTabs />);
      
      const usernameInput = screen.getByLabelText('Nome de usuário') as HTMLInputElement;
      fireEvent.change(usernameInput, { target: { value: 'user_123' } });
      
      expect(usernameInput.value).toBe('user_123');
    });

    it('should handle email with special characters', () => {
      render(<SettingsTabs />);
      
      const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'user.name+tag@example.com' } });
      
      expect(emailInput.value).toBe('user.name+tag@example.com');
    });

    it('should render all inputs with fullWidth prop', () => {
      const { container } = render(<SettingsTabs />);
      
      const fullWidthInputs = container.querySelectorAll('.w-full');
      expect(fullWidthInputs.length).toBeGreaterThan(0);
    });
  });

  describe('Restrictions Tab - Fixed Tests', () => {
    it('should render empty state icon with size 64', () => {
      render(<SettingsTabs />);
      fireEvent.click(screen.getByText('Restrições'));
      
      const blockIcons = screen.getAllByTestId('block-icon');
      const emptyStateIcon = blockIcons.find(icon => icon.textContent === '64');
      
      expect(emptyStateIcon).toBeInTheDocument();
      expect(emptyStateIcon).toHaveClass('text-gray-300');
    });

    it('should render block icon in tab with size 24', () => {
      render(<SettingsTabs />);
      
      const blockIcons = screen.getAllByTestId('block-icon');
      const tabIcon = blockIcons.find(icon => icon.textContent === '24');
      
      expect(tabIcon).toBeInTheDocument();
    });

    it('should have exactly 2 block icons when on restrictions tab', () => {
      render(<SettingsTabs />);
      fireEvent.click(screen.getByText('Restrições'));
      
      const blockIcons = screen.getAllByTestId('block-icon');
      expect(blockIcons).toHaveLength(2);
    });

    it('should render block icon with mx-auto class in empty state', () => {
      render(<SettingsTabs />);
      fireEvent.click(screen.getByText('Restrições'));
      
      const blockIcons = screen.getAllByTestId('block-icon');
      const emptyStateIcon = blockIcons.find(icon => icon.classList.contains('mx-auto'));
      
      expect(emptyStateIcon).toBeInTheDocument();
    });

    it('should render plus checkbox icon in block button', () => {
      render(<SettingsTabs />);
      fireEvent.click(screen.getByText('Restrições'));
      
      expect(screen.getByTestId('plus-checkbox-icon')).toBeInTheDocument();
    });

    it('should render block accounts button with correct text', () => {
      render(<SettingsTabs />);
      fireEvent.click(screen.getByText('Restrições'));
      
      const blockButton = screen.getByText('Bloquear Contas');
      expect(blockButton).toBeInTheDocument();
    });

    it('should apply flex justify-end to button container', () => {
      const { container } = render(<SettingsTabs />);
      fireEvent.click(screen.getByText('Restrições'));
      
      const buttonContainer = container.querySelector('.flex.justify-end');
      expect(buttonContainer).toBeInTheDocument();
    });
  });

  describe('Tab Persistence Tests', () => {
    it('should keep restrictions tab active after interaction', () => {
      render(<SettingsTabs />);
      
      fireEvent.click(screen.getByText('Restrições'));
      const restrictionsTab = screen.getByText('Restrições').closest('button');
      
      expect(restrictionsTab).toHaveAttribute('aria-selected', 'true');
    });

    it('should deactivate previous tab when switching', () => {
      render(<SettingsTabs />);
      
      const profileTab = screen.getByText('Meu Perfil').closest('button');
      expect(profileTab).toHaveAttribute('aria-selected', 'true');
      
      fireEvent.click(screen.getByText('Segurança'));
      expect(profileTab).toHaveAttribute('aria-selected', 'false');
    });

    it('should show correct panel content when switching tabs', () => {
      render(<SettingsTabs />);
      
      fireEvent.click(screen.getByText('Segurança'));
      expect(screen.getByText('Alterar senha')).toBeInTheDocument();
      expect(screen.queryByText('Informações Pessoais')).not.toBeInTheDocument();
    });

    it('should maintain all tabs visible when switching', () => {
      render(<SettingsTabs />);
      
      fireEvent.click(screen.getByText('Notificações'));
      
      expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
      expect(screen.getByText('Notificações')).toBeInTheDocument();
      expect(screen.getByText('Segurança')).toBeInTheDocument();
      expect(screen.getByText('Restrições')).toBeInTheDocument();
    });
  });

  describe('Notification Descriptions Tests', () => {
    it('should render complete like notification description', () => {
      render(<SettingsTabs />);
      fireEvent.click(screen.getByText('Notificações'));
      
      expect(screen.getByText('Quando alguém curtir sua publicação')).toBeInTheDocument();
    });

    it('should render complete comment notification description', () => {
      render(<SettingsTabs />);
      fireEvent.click(screen.getByText('Notificações'));
      
      expect(screen.getByText('Quando alguém comentar suas publicações')).toBeInTheDocument();
    });

    it('should render complete mention notification description', () => {
      render(<SettingsTabs />);
      fireEvent.click(screen.getByText('Notificações'));
      
      expect(screen.getByText('Quando alguém mencionar você')).toBeInTheDocument();
    });

    it('should render complete followers notification description', () => {
      render(<SettingsTabs />);
      fireEvent.click(screen.getByText('Notificações'));
      
      expect(screen.getByText('Quando alguém começar a seguir você')).toBeInTheDocument();
    });
  });

  describe('Security Options Tests', () => {
    it('should render password change option with description', () => {
      render(<SettingsTabs />);
      fireEvent.click(screen.getByText('Segurança'));
      
      expect(screen.getByText('Alterar senha')).toBeInTheDocument();
      expect(screen.getByText('Última alteração há 3 meses')).toBeInTheDocument();
    });

    it('should render 2FA option with description', () => {
      render(<SettingsTabs />);
      fireEvent.click(screen.getByText('Segurança'));
      
      expect(screen.getByText('Autenticação de dois fatores')).toBeInTheDocument();
      expect(screen.getByText('Adicione uma camada extra de segurança')).toBeInTheDocument();
    });

    it('should render active sessions option with description', () => {
      render(<SettingsTabs />);
      fireEvent.click(screen.getByText('Segurança'));
      
      expect(screen.getByText('Sessões ativas')).toBeInTheDocument();
      expect(screen.getByText('1 dispositivo conectado')).toBeInTheDocument();
    });

    it('should render chevron icons in all security buttons', () => {
      render(<SettingsTabs />);
      fireEvent.click(screen.getByText('Segurança'));
      
      const chevronIcons = screen.getAllByTestId('chevron-right-icon');
      const securityChevrons = chevronIcons.filter(icon => icon.textContent === '20');
      
      expect(securityChevrons.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Critical Settings Tests', () => {
    it('should render deactivate button with red theme', () => {
      const { container } = render(<SettingsTabs />);
      
      const deactivateButton = screen.getByText('Desativar conta temporariamente').closest('button');
      expect(deactivateButton).toHaveClass('hover:bg-red-50');
    });

    it('should render delete button with red theme', () => {
      const { container } = render(<SettingsTabs />);
      
      const deleteButton = screen.getByText('Excluir conta permanentemente').closest('button');
      expect(deleteButton).toHaveClass('hover:bg-red-50');
    });

    it('should render pause icon in deactivate button with size 24', () => {
      render(<SettingsTabs />);
      
      const pauseIcon = screen.getByTestId('pause-icon');
      expect(pauseIcon).toHaveTextContent('24');
    });

    it('should render trash icon in delete button with size 24', () => {
      render(<SettingsTabs />);
      
      const trashIcon = screen.getByTestId('trash-icon');
      expect(trashIcon).toHaveTextContent('24');
    });

    it('should have red border on critical settings buttons', () => {
      const { container } = render(<SettingsTabs />);
      
      const deactivateButton = screen.getByText('Desativar conta temporariamente').closest('button');
      expect(deactivateButton).toHaveClass('border-red-200');
    });
  });

  describe('Username Header Update Tests', () => {
    it('should update header when username changes', () => {
      render(<SettingsTabs />);
      
      const usernameInput = screen.getByLabelText('Nome de usuário') as HTMLInputElement;
      fireEvent.change(usernameInput, { target: { value: 'newusername' } });
      
      expect(screen.getByText('@newusername')).toBeInTheDocument();
      expect(screen.queryByText('@user')).not.toBeInTheDocument();
    });

    it('should show empty header when username is cleared', () => {
      render(<SettingsTabs />);
      
      const usernameInput = screen.getByLabelText('Nome de usuário') as HTMLInputElement;
      fireEvent.change(usernameInput, { target: { value: '' } });
      
      expect(screen.getByText(/@$/)).toBeInTheDocument();
    });
  });
});