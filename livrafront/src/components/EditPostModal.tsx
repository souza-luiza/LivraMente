'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Button from '@/components/button';
import TrashIcon from './icons/TrashIcon';
import { postsService } from '@/services/posts';
import { Imagens, Post } from '@/types/post';
import { motion, AnimatePresence } from 'framer-motion';
import CommunityIcon from './icons/CommunityIcon';
import SaveIcon from './icons/SaveIcon';

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
  const [images, setImages] = useState<Imagens[]>(post.imagens);
  const [requestReview, setRequestReview] = useState(post.solicitacao_revisao);
  const [isContentFocused, setIsContentFocused] = useState(false);
  const [contentError, setContentError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isOpen && post) {
      setContent(post.conteudo);
      setImages(post.imagens);
      setContentError('');
      setSubmitError('');
    }
  }, [isOpen, post]);

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
      await postsService.updatePost(
        post._id,
        {
          conteudo: content.trim(),
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

  const handleCancel = () => {
    setContent('');
    setImages([]);
    setRequestReview(false);
    setContentError('');
    setSubmitError('');
    onClose();
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
          className="relative flex-shrink-0 bg-gray-50 medium-padding medium-border-radius"
          style={{
            color: 'var(--primary-800)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Título do Modal */}
          <div className="flex flex-row justify-between items-center text-h5 mb-4">
              <h1>Editar Postagem</h1>
              <div className="flex flex-row items-center gap-1">
                <CommunityIcon size={24} />
                <h2>{post.comunidade.nome}</h2>
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
                background: 'linear-gradient(to bottom, var(--color-gray-50) 50%, var(--background) 50%)',
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
              className="w-full px-3 py-2 text-b2 rounded resize-none light-neutral medium-box transition-all duration-200 small-border-width border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-900 placeholder:text-gray-400 text-gray-900"
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
                    className="relative overflow-hidden group hover:cursor-not-allowed"
                    style={{
                      aspectRatio: '1',
                      borderRadius: 'var(--medium-border-radius)',
                    }}
                  >
                    <Image
                      src={image.secure_url}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
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
          <div className="flex flex-row items-center justify-end gap-1">
            {/* Botão de Cancelar */}
            <Button
              text="Cancelar"
              icon={<TrashIcon />}
              size="medium"
              colorScheme="light-brown"
              onClick={handleCancel}
              aria-label="Cancelar"
              disabled={isSubmitting}
            />

            {/* Botão de Postar */}
            <Button
              text={isSubmitting ? "Salvando..." : "Salvar Alterações"}
              icon={<SaveIcon />}
              size="medium"
              colorScheme="light-green"
              onClick={handlePost}
              aria-label="Salvar Alterações"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}