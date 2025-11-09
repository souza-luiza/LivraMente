"use client";

import Image from 'next/image';
import { Post } from '@/types/post';
import { useState, useEffect } from 'react';
import Button from './button';
import RemoveIcon from './icons/RemoveIcon';
import CodeIcon from './icons/CodeIcon';
import { motion } from 'framer-motion';

interface PostImageProps {
  post: Post;
  image: string;
  onClose: () => void;
}

export default function PostImage({ post, image, onClose }: PostImageProps) {
    const [selectedImage, setSelectedImage] = useState<string>(image);

    const currentIndex = post.imagens.findIndex((img) => img === selectedImage);

    useEffect(() => {
        // Desabilita scrollagem da página ao abrir o modal
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                // ESC para fechar o modal
                onClose();

            } else if (e.key === 'ArrowRight') {
                // Seta direita: próxima imagem
                setSelectedImage((prev) => {
                    const current = post.imagens.findIndex((img) => img === prev);
                    const next = (current + 1) % post.imagens.length;
                    return post.imagens[next];
                });

            } else if (e.key === 'ArrowLeft') {
                // Seta esquerda: imagem anterior
                setSelectedImage((prev) => {
                    const current = post.imagens.findIndex((img) => img === prev);
                    const next = (current - 1 + post.imagens.length) % post.imagens.length;
                    return post.imagens[next];
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };

    }, [onClose, post.imagens]);

    const handleSelectImage = (imgUrl: string) => {
        setSelectedImage(imgUrl);
    }

    if (!image || !post.imagens || post.imagens.length === 0) return null;

    return (
        <motion.div 
            className="fixed inset-0 z-50 flex flex-col items-center justify-center pb-40"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            onClick={onClose}
        >        
            {/*Botão de Fechar*/}
            <div className="absolute top-4 right-4">
                <Button
                    icon={<RemoveIcon />}
                    size="medium"
                    colorScheme="dark-green"
                    onClick={(e) => {e.stopPropagation(); onClose();}}
                />
            </div>

            {/*Imagem Selecionada*/}
            <div 
                className="relative max-w-[90vw] max-h-[calc(100vh-200px)] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                <Image
                    src={selectedImage}
                    alt="Imagem Selecionada"
                    width={1000}
                    height={1000}
                    className="object-contain w-auto h-auto max-w-full max-h-full"
                />
            </div>

            {/*Seleção de Imagem - Miniaturas*/}
            {post.imagens && post.imagens.length > 0 && (
            <div className="absolute bottom-0 w-full flex flex-col gap-2 flex-shrink-0 items-center justify-center mt-2 mb-4">
                <div 
                    className="flex flex-row gap-2 dark-green medium-box"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h6 className="text-h6">{post.comunidade.nome}</h6>
                    <CodeIcon size={24} />
                    <h6 className="text-h6">@{post.autor.username}</h6>
                </div>
                <div className="flex flex-row gap-2">
                    {post.imagens.map((imgUrl, index) => (
                        <div 
                            key={index} 
                            className={`relative w-24 h-24 medium-border-radius overflow-hidden hover:cursor-pointer ${imgUrl === selectedImage && 'large-border-width border-[var(--primary-700)]'}`}
                            onClick={(e) => {e.stopPropagation(); e.preventDefault(); handleSelectImage(imgUrl)}}
                        >
                            <Image
                                src={imgUrl}
                                alt={`Imagem do post ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>
            )}
        </motion.div>
    );
}