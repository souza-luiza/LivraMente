import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PasswordStrength from '../../src/components/password-strength';

describe('PasswordStrength', () => {
  it('renders without crashing', () => {
    render(<PasswordStrength password="" />);
    expect(screen.getByText('Força da senha:')).toBeInTheDocument();
  });

  it('shows no strength label for empty password', () => {
    render(<PasswordStrength password="" />);
    expect(screen.queryByText('Fraca')).not.toBeInTheDocument();
    expect(screen.queryByText('Média')).not.toBeInTheDocument();
    expect(screen.queryByText('Forte')).not.toBeInTheDocument();
  });

  it('shows "Fraca" for weak password', () => {
    render(<PasswordStrength password="abc123" />);
    expect(screen.getByText('Fraca')).toBeInTheDocument();
  });

  it('shows "Média" for medium password', () => {
    render(<PasswordStrength password="Abc12345" />);
    expect(screen.getByText('Média')).toBeInTheDocument();
  });

  it('shows "Forte" for strong password', () => {
    render(<PasswordStrength password="Abc123!@#456" />);
    expect(screen.getByText('Forte')).toBeInTheDocument();
  });

  it('displays all password requirements', () => {
    render(<PasswordStrength password="" />);
    expect(screen.getByText('Mínimo 8 caracteres')).toBeInTheDocument();
    expect(screen.getByText('Letras maiúsculas e minúsculas')).toBeInTheDocument();
    expect(screen.getByText('Números')).toBeInTheDocument();
    expect(screen.getByText('Caracteres especiais')).toBeInTheDocument();
  });

  it('checks minimum 8 characters requirement', () => {
    const { rerender } = render(<PasswordStrength password="Abc12!" />);
    expect(screen.getByText('Mínimo 8 caracteres').className).toContain('text-gray-500');
    
    rerender(<PasswordStrength password="Abc12!@#" />);
    expect(screen.getByText('Mínimo 8 caracteres').className).toContain('text-green-700');
  });

  it('checks uppercase and lowercase requirement', () => {
    const { rerender } = render(<PasswordStrength password="abc12345" />);
    expect(screen.getByText('Letras maiúsculas e minúsculas').className).toContain('text-gray-500');
    
    rerender(<PasswordStrength password="Abc12345" />);
    expect(screen.getByText('Letras maiúsculas e minúsculas').className).toContain('text-green-700');
  });

  it('checks numbers requirement', () => {
    const { rerender } = render(<PasswordStrength password="Abcdefgh" />);
    expect(screen.getByText('Números').className).toContain('text-gray-500');
    
    rerender(<PasswordStrength password="Abcdefgh1" />);
    expect(screen.getByText('Números').className).toContain('text-green-700');
  });

  it('checks special characters requirement', () => {
    const { rerender } = render(<PasswordStrength password="Abc12345" />);
    expect(screen.getByText('Caracteres especiais').className).toContain('text-gray-500');
    
    rerender(<PasswordStrength password="Abc12345!" />);
    expect(screen.getByText('Caracteres especiais').className).toContain('text-green-700');
  });
});