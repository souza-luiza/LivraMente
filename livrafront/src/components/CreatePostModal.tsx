'use client';

import { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/button';
import TrashIcon from './icons/TrashIcon';
import ImageIcon from './icons/ImageIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityName: string;
  onPost: (data: {
    content: string;
    images: string[];
    requestReview: boolean;
  }) => void;
}

export default function CreatePostModal({
  isOpen,
  onClose,
  communityName,
  onPost,
}: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [requestReview, setRequestReview] = useState(false);
  const [isContentFocused, setIsContentFocused] = useState(false);
  const [contentError, setContentError] = useState('');

  if (!isOpen) return null;

  const validateContent = (value: string): boolean => {
    if (!value || value.trim().length === 0) {
      setContentError('O conteúdo da postagem é obrigatório');
      return false;
    }
    setContentError('');
    return true;
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    if (contentError) {
      validateContent(value);
    }
  };

  const handlePost = () => {
    if (!validateContent(content)) {
      return;
    }

    onPost({
      content: content.trim(),
      images,
      requestReview,
    });
    
    // Reset form
    setContent('');
    setImages([]);
    setRequestReview(false);
    setContentError('');
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const remainingSlots = 4 - images.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      
      const readFileAsDataURL = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              resolve(reader.result as string);
            } else {
              reject(new Error('Failed to read file'));
            }
          };
          reader.onerror = () => reject(new Error('FileReader error'));
          reader.readAsDataURL(file);
        });
      };

      Promise.all(filesToProcess.map(readFileAsDataURL))
        .then((newImages) => {
          setImages([...images, ...newImages]);
        })
        .catch((error) => {
          console.error('Error reading files:', error);
        });
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    setContent('');
    setImages([]);
    setRequestReview(false);
    setContentError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={handleCancel}
    >
      <div
        className="relative w-full max-w-2xl large-padding large-border-radius"
        style={{
          backgroundColor: 'var(--primary-200)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Título do Modal */}
        <h4
          className="text-h5 mb-6"
          style={{ color: 'var(--secondary-800)' }}
        >
          Criar postagem em {communityName}
        </h4>

        {/* Campo de Texto */}
        <div className="mb-6 relative">
          <label
            htmlFor="content-textarea"
            className={`absolute -top-2.5 left-2 px-1 text-b3 transition-opacity duration-200 pointer-events-none ${
              isContentFocused ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ 
              color: 'var(--primary-800)',
              background: 'linear-gradient(to bottom, var(--primary-200) 50%, var(--background) 50%)',
            }}
          >
            Conteúdo
          </label>
          <textarea
            id="content-textarea"
            value={content}
            onChange={handleContentChange}
            onFocus={() => setIsContentFocused(true)}
            onBlur={() => {
              setIsContentFocused(false);
              validateContent(content);
            }}
            className="w-full px-3 py-2 text-b2 rounded resize-none light-neutral medium-box transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-900 placeholder:text-gray-400 text-gray-900"
            style={{
              minHeight: '200px',
              borderColor: contentError ? 'var(--error-500)' : undefined,
            }}
            placeholder="Texto da postagem..."
            required
          />
          {contentError && (
            <p className="text-b3 mt-1" style={{ color: 'var(--error-500)' }}>
              {contentError}
            </p>
          )}
        </div>

        {/* Preview de Imagens */}
        {images.length > 0 && (
          <div className="mb-6">
            <h5 className="text-b2 mb-2" style={{ color: 'var(--secondary-800)' }}>
              Imagens ({images.length}/4)
            </h5>
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden group"
                  style={{
                    aspectRatio: '1',
                    borderRadius: 'var(--medium-border-radius)',
                  }}
                >
                  <Image
                    src={image}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {/* Botão para remover imagem */}
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    }}
                    aria-label="Remover imagem"
                  >
                    <TrashIcon size={16} color="white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checkbox de Pedir Avaliação */}
        <div className="mb-6 flex items-center gap-2">
          <input
            type="checkbox"
            id="review-checkbox"
            checked={requestReview}
            onChange={(e) => setRequestReview(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
            style={{
              accentColor: 'var(--primary-600)',
            }}
          />
          <label
            htmlFor="review-checkbox"
            className="text-b2 cursor-pointer"
            style={{ color: 'var(--secondary-800)' }}
          >
            Pedir avaliação dos moderadores (para seção de fanarts)
          </label>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-row items-center justify-between gap-2">
          {/* Botão de Adicionar Imagem */}
          <div>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageChange}
              disabled={images.length >= 4}
            />
            <Button
              text={`Adicionar imagens ${images.length > 0 ? `(${images.length}/4)` : ''}`}
              icon={<ImageIcon />}
              size="medium"
              colorScheme="light-green"
              onClick={() => document.getElementById('image-upload')?.click()}
              aria-label="Adicionar imagens"
              disabled={images.length >= 4}
            />
          </div>

          <div className="flex gap-2">
            {/* Botão de Cancelar */}
            <Button
              text="Cancelar"
              icon={<TrashIcon />}
              size="medium"
              colorScheme="dark-brown"
              onClick={handleCancel}
              aria-label="Cancelar"
            />

            {/* Botão de Postar */}
            <Button
              text="Postar"
              icon={<ChevronRightIcon />}
              size="medium"
              colorScheme="dark-green"
              onClick={handlePost}
              aria-label="Postar"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
