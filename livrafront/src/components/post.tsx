"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Componentes
import Button from "./button";
import PostImage from "./post-image";

// Types
import { Post } from "@/types/post";

// Ícones
import CodeIcon from "./icons/CodeIcon";
import HeartIcon from "./icons/HeartIcon";
import CommentIcon from "./icons/CommentIcon";
import TrashIcon from "./icons/TrashIcon";

interface PostProps {
    post: Post;
    isOwner?: boolean;
    isModerator?: boolean;
}

export default function PostComponent({ 
    post, 
    isOwner = false,
    isModerator = false
}: PostProps) {

    const router = useRouter();

    // Gerenciamento do overflow do conteúdo do post
    const [isOverflowed, setIsOverflowed] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [maxHeight, setMaxHeight] = useState<string | undefined>(undefined);
    const contentRef = useRef<HTMLParagraphElement>(null);

    // Gerenciamento do modal de imagem
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);

    useEffect(() => {
        if (contentRef.current) {
            const el = contentRef.current;
            const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
            const maxVisibleHeight = lineHeight * 4;
            setMaxHeight(expanded ? `${el.scrollHeight}px` : `${maxVisibleHeight}px`);
            setIsOverflowed(el.scrollHeight > maxVisibleHeight);
        }
    }, [post.conteudo, expanded]);

    const handleRedirectToPost = () => {
        router.push(`/${post.comunidade.nome}/posts/${post._id}`);
    }

    const handleRedirectToProfile = () => {
        router.push(`/${post.autor.username}`);
    }

    const handleOpenImageModal = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setShowImageModal(true);
    }

    const handleLikePost = async () => {
        // Curtir post
    }

    const handleDeletePost = () => {
        // Deletar post
    }

    return (
        <div className="flex flex-col gap-3 light-neutral medium-border-width medium-box hover:shadow-lg transition-shadow">
            <div className="flex flex-row gap-2">
                <h6 className="text-h6">
                    {post.comunidade.nome}
                </h6>
                <CodeIcon size={24} />
                <h6 
                    className="text-h6 hover:cursor-pointer"
                    onClick={handleRedirectToProfile}
                >
                    @{post.autor.username}
                </h6>
            </div>
            <div className="flex-1 overflow-hidden">
                <p
                    ref={contentRef}
                    style={{ maxHeight, overflow: 'hidden', transition: 'max-height 0.3s ease', wordBreak: 'break-word', overflowWrap: 'break-word' }}
                    className="text-b2 whitespace-pre-line"
                >
                    {post.conteudo}
                </p>
                {isOverflowed && (
                    <span
                        className="text-b2 body-semibold text-[var(--primary-700)] hover:cursor-pointer"
                        onClick={() => setExpanded(prev => !prev)}
                    >
                        {expanded ? "Ver menos..." : "Ver mais..."}
                    </span>
                )}
            </div>

            {/*Imagens*/}
            {post.imagens && post.imagens.length > 0 && (
            <div className="flex flex-nowrap gap-2 overflow-x-auto">
                {post.imagens.map((imgUrl, index) => (
                <div 
                    key={index} 
                    className="relative w-32 h-32 medium-border-radius overflow-hidden cursor-pointer"
                    onClick={() => handleOpenImageModal(imgUrl)}
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
            )}

            {showImageModal && selectedImage && (
            <PostImage 
                post={post} 
                image={selectedImage} 
                onClose={() => setShowImageModal(false)} 
            />
            )}

            <div className="flex flex-row gap-1">
                <Button 
                    text={String(post.curtidas.length)}
                    colorScheme="dark-brown" 
                    size="small"
                    icon={<HeartIcon />}
                    onClick={handleLikePost}
                />
                <Button 
                    text={String(post.comentarios.length)}
                    colorScheme="dark-brown"
                    size="small"
                    icon={<CommentIcon />}
                    onClick={handleRedirectToPost}
                />
                {(isModerator || isOwner) && <Button
                    text="Excluir" 
                    colorScheme="dark-brown"
                    size="small"
                    icon={<TrashIcon />}
                    onClick={handleDeletePost}
                />}
            </div>
        </div>

    )
}