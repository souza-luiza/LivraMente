'use client';

import { useState } from 'react';
import Image from 'next/image';
import Input from '@/components/general-input';
import Button from '@/components/button';
import TrashIcon from './icons/TrashIcon';
import SaveIcon from './icons/SaveIcon';

interface EditReadlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  readlist: {
    id: string;
    title: string;
    description: string;
    coverImage: string;
    isPrivate: boolean;
  };
  onSave: (data: {
    title: string;
    description: string;
    coverImage: string;
    isPrivate: boolean;
  }) => void;
}

export default function EditReadlistModal({
  isOpen,
  onClose,
  readlist,
  onSave,
}: EditReadlistModalProps) {
  const [title, setTitle] = useState(readlist.title);
  const [description, setDescription] = useState(readlist.description);
  const [coverImage, setCoverImage] = useState(readlist.coverImage);
  const [isPrivate, setIsPrivate] = useState(readlist.isPrivate);
  const [titleError, setTitleError] = useState('');
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);

  if (!isOpen) return null;

  const validateTitle = (value: string): boolean => {
    if (!value || value.trim().length === 0) {
      setTitleError('O título é obrigatório');
      return false;
    }
    setTitleError('');
    return true;
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    if (titleError) {
      validateTitle(value);
    }
  };

  const handleSave = () => {
    if (!validateTitle(title)) {
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      coverImage,
      isPrivate,
    });
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implementar upload de imagem real
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg large-box"
        style={{
          backgroundColor: 'var(--primary-200)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Título do Modal */}
        <h4
          className="text-h4 mb-6"
          style={{ color: 'var(--secondary-800)' }}
        >
          Editar detalhes 
        </h4>

        {/* Container Principal com Imagem e Campos */}
        <div className="flex gap-6 mb-6">
          {/* Imagem de Capa */}
          <div className="flex-shrink-0">
            <div
              className="relative overflow-hidden group cursor-pointer"
              style={{
                width: '180px',
                height: '180px',
                borderRadius: 'var(--medium-border-radius)',
                backgroundColor: 'var(--secondary-400)',
              }}
            >
              <Image
                src={coverImage}
                alt="Capa da readlist"
                fill
                className="object-cover"
              />
              
              {/* Overlay para trocar imagem */}
              <label
                htmlFor="cover-upload"
                className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                }}
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="white"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M24 14V34M14 24H34" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                <span className="text-white text-sm mt-2">Escolher foto</span>
              </label>
              
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* Campos de Edição */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Título */}
            <div className="relative">
              <label
                htmlFor="title-input"
                className={`absolute -top-2.5 left-2 px-1 text-b3 transition-opacity duration-200 pointer-events-none z-10 ${
                  isTitleFocused ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ 
                  color: 'var(--primary-800)',
                  background: 'linear-gradient(to bottom, var(--primary-200) 50%, var(--background) 50%)',
                }}
              >
                Título
              </label>
              <Input
                id="title-input"
                type="text"
                value={title}
                onChange={handleTitleChange}
                onFocus={() => setIsTitleFocused(true)}
                onBlur={() => {
                  setIsTitleFocused(false);
                  validateTitle(title);
                }}
                placeholder="Título da readlist"
                error={titleError}
                fullWidth
                variant="default"
                inputSize="medium"
                colorScheme="light-neutral"
                required
              />
            </div>

            {/* Descrição */}
            <div className="flex-1 relative">
              <label
                htmlFor="description-textarea"
                className={`absolute -top-2.5 left-2 px-1 text-b3 transition-opacity duration-200 pointer-events-none ${
                  isDescriptionFocused ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ 
                  color: 'var(--primary-800)',
                  background: 'linear-gradient(to bottom, var(--primary-200) 50%, var(--background) 50%)',
                }}
              >
                Descrição
              </label>
              <textarea
                id="description-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onFocus={() => setIsDescriptionFocused(true)}
                onBlur={() => setIsDescriptionFocused(false)}
                className="w-full h-full px-3 py-2 text-b3 rounded resize-none light-neutral medium-box transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-900 placeholder:text-gray-400 text-gray-900"
                style={{
                  minHeight: '120px',
                }}
                placeholder="Adicione uma descrição opcional"
              />
            </div>
          </div>
        </div>

        {/* Checkbox de Privacidade */}
        <div className="mb-6 flex items-center gap-2">
          <input
            type="checkbox"
            id="private-checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
            style={{
              accentColor: 'var(--primary-600)',
            }}
          />
          <label
            htmlFor="private-checkbox"
            className="text-b2 cursor-pointer"
            style={{ color: 'var(--secondary-800)' }}
          >
            Tornar readlist privada
          </label>
        </div>
        
        <div className='flex flex-row items-center justify-center gap-2'>
          {/* Botão de Fechar */}
          <div>
            <Button
              text="Cancelar"
              icon={<TrashIcon />}
              size="medium"
              colorScheme="dark-brown"
              onClick={onClose}
              aria-label="Fechar"
            />
          </div>

          {/* Botão Salvar */}
          <div>
            <Button
              text="Salvar Alterações"
              icon={<SaveIcon />}
              size="medium"
              colorScheme="dark-green"
              onClick={handleSave}
            />
          </div>
        </div>
      </div>
    </div>
  );
}