'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Button from '@/components/button';
import TrashIcon from './icons/TrashIcon';
import ImageIcon from './icons/ImageIcon';
import { postsService } from '@/services/posts';
import Edit2Icon from './icons/Edit2Icon';
import { Post } from '@/types/post';
import CodeIcon from './icons/CodeIcon';
import { motion, AnimatePresence } from 'framer-motion';

interface EditPostModalProps {
    post: Post;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void; 
}

export default function EditPostModal({
    post,
    isOpen,
    onClose,
    onSuccess,
}: EditPostModalProps) {

  const [content, setContent] = useState(post.conteudo);
  const [images, setImages] = useState<string[]>(post.imagens);
  const [requestReview, setRequestReview] = useState(post.solicitacao_revisao);
  const [isContentFocused, setIsContentFocused] = useState(false);
  const [contentError, setContentError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Desabilita scrollagem da página ao abrir o modal
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !post) return null;

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

  const handlePost = async () => {
    // Validar conteúdo
    if (!validateContent(content)) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Manda dados para a edição do post
      const editedPost = await postsService.updatePost(
        post._id,
        {
          conteudo: content.trim(),
          imagens: images.length > 0 ? images : undefined,
          solicitacao_revisao: requestReview,
          publico: true
        }
      );

      // Reset do modal
      setContent('');
      setImages([]);
      setRequestReview(false);
      setContentError('');
      setSubmitError('');
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error: unknown) {
      console.error('Erro ao criar post:', error);
      const message = error instanceof Error ? error.message : String(error);
      setSubmitError(
        message || 'Erro ao criar postagem. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para comprimir imagem
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Falha ao criar contexto canvas'));
            return;
          }

          // Definir tamanho máximo
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          // Calcular novas dimensões mantendo aspect ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Comprimir para JPEG com 70% de qualidade
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error('Erro ao carregar imagem'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const remainingSlots = 4 - images.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);

      Promise.all(filesToProcess.map(compressImage))
        .then((newImages) => {
          setImages([...images, ...newImages]);
        })
        .catch((error: unknown) => {
          console.error('Erro ao processar imagens:', error);
          setSubmitError('Erro ao processar imagens. Tente novamente.');
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
    setSubmitError('');
    onClose();
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
        onClick={handleCancel}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <div
          className="relative w-full max-w-1/2 large-padding large-border-radius"
          style={{
            backgroundColor: 'var(--primary-200)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Título do Modal */}
          <div className="flex flex-row justify-between text-h5 text-[var(--secondary-800)] items-center mb-6">
              <h1>
                  Editar Postagem
              </h1>
              <div className="flex flex-row text-h6 medium-box light-green gap-2">
                  <h2>{post.comunidade.nome}</h2>
                  <CodeIcon size={24} />
                  <h2>@{post.autor.username}</h2>
              </div>
          </div>

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
              disabled={isSubmitting}
            />
            <label
              htmlFor="review-checkbox"
              className="text-b2 cursor-pointer"
              style={{ color: 'var(--secondary-800)' }}
            >
              Submeter como fanart/fanfic
            </label>
          </div>

          {/* Mensagem de erro */}
          {submitError && (
            <p className="text-b3 mb-4" style={{ color: 'var(--error-500)' }}>
              {submitError}
            </p>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-row items-center justify-between gap-2">
            {/* Botão de Adicionar Imagem */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"  
                multiple
                onChange={handleImageChange}
                disabled={images.length >= 4}
                style={{ display: "none" }}
              />
              <Button
                text={`Adicionar Imagens ${images.length > 0 ? `(${images.length}/4)` : ''}`}
                icon={<ImageIcon />}
                size="medium"
                colorScheme="light-green"
                onClick={handleButtonClick}
                aria-label="Adicionar imagens"
                disabled={images.length >= 4 || isSubmitting}
              />
            </div>

            <div className="flex gap-1">
              {/* Botão de Cancelar */}
              <Button
                text="Cancelar"
                icon={<TrashIcon />}
                size="medium"
                colorScheme="dark-brown"
                onClick={handleCancel}
                aria-label="Cancelar"
                disabled={isSubmitting}
              />

              {/* Botão de Postar */}
              <Button
                text={isSubmitting ? "Salvando..." : "Salvar Alterações"}
                icon={<Edit2Icon />}
                size="medium"
                colorScheme="dark-green"
                onClick={handlePost}
                aria-label="Salvar Alterações"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}