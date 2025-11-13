"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Componentes
import Button from "./button";
import PostImage from "./post-image";
import EditPostModal from "./EditPostModal";
import PopUp from "./pop-up";

// Types
import { Post } from "@/types/post";

// Ícones
import CodeIcon from "./icons/CodeIcon";
import HeartIcon from "./icons/HeartIcon";
import CommentIcon from "./icons/CommentIcon";
import TrashIcon from "./icons/TrashIcon";
import MoreHorizontalIcon from "./icons/MoreHorizontalIcon";
import EditIcon from "./icons/EditIcon";

// Chamadas à API
import { postsService } from "@/services/posts";

// Data
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CommunityIcon from "./icons/CommunityIcon";
import { text } from "stream/consumers";
import RemoveIcon from "./icons/RemoveIcon";

interface PostProps {
    post: Post;
    currentUser?: string; // TODO: substituir por User
    isModerator?: boolean;
    disableActions?: boolean;
    onDelete?: () => void;
    onUpdate?: () => void;
}

function getTimeAgo(createdAt: string): string {
  return formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: ptBR,
  });
}

export default function PostComponent({ 
    post, 
    isModerator = false,
    disableActions = false,
    onDelete,
    onUpdate
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

    // Curtidas
    const [liked, setLiked] = useState(false); // TODO: Verificar se o usuário já curtiu o post
    const [likeAmount, setLikeAmount] = useState(post.curtidas.length);

    const isOwner = true; // TODO: Verificar se o usuário é o dono do post

    // Botão Mais
    const [showOptions, setShowOptions] = useState(false);
    const [clickPosition, setClickPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const menuRef = useRef<HTMLDivElement | null>(null);

    // Edição do post
    const [showEditModal, setShowEditModal] = useState(false);

    // Pop Up de Confirmação
    const [showConfirmDeletePopUp, setShowConfirmDeletePopUp] = useState(false);

    // Carregando
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (contentRef.current) {
            const el = contentRef.current;
            const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
            const maxVisibleHeight = lineHeight * 4;
            setMaxHeight(expanded ? `${el.scrollHeight}px` : `${maxVisibleHeight}px`);
            setIsOverflowed(el.scrollHeight > maxVisibleHeight);
        }
    }, [post.conteudo, expanded]);

    useEffect(() => {
        if (showOptions && menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            const menuWidth = rect.width;
            const menuHeight = rect.height;

            setClickPosition((prev) => {
                let x = prev.x;
                let y = prev.y;

                if (x + menuWidth > window.innerWidth) {
                    x = window.innerWidth - menuWidth - 10;
                }
                if (y + menuHeight > window.innerHeight) {
                    y = window.innerHeight - menuHeight - 10;
                }

                return { x, y };
            });
        }
    }, [showOptions]);

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
        try {
            // Curtir/descurtir post
            const { liked, likeAmount } = await postsService.likePost(post._id);

            setLiked(liked);
            setLikeAmount(likeAmount);

        } catch (error) {
            console.error("Erro ao curtir/descurtir o post:", error);
        }
    }

    const handleMoreOptions = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const menuWidth = 150;
        const menuHeight = 100;

        const x = clientX + menuWidth > window.innerWidth 
            ? window.innerWidth - menuWidth - 10 
            : clientX;

        const y = clientY + menuHeight > window.innerHeight 
            ? window.innerHeight - menuHeight - 10 
            : clientY;

        setClickPosition({ x, y });
        setShowOptions((prev) => !prev);
    };

    const handleConfirmDeletePost = () => {
        setShowOptions(false);
        setShowConfirmDeletePopUp(true);
    }

    const handleDeletePost = async () => {
        setShowOptions(false);
        setLoading(true);

        try {
            // Deletar post
            await postsService.removePost(post._id);
            onDelete && onDelete();

        } catch (error) {
            console.error("Erro ao excluir o post:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleEditPost = async () => {
        setShowOptions(false);
        setShowEditModal(true);
    }

    const handleEditSuccess = () => {
        setShowEditModal(false);
        onUpdate && onUpdate();
    }

    return (
        <motion.div onHoverEnd={() => setShowOptions(false)}>
            <div className="flex flex-col gap-3 light-neutral medium-border-width medium-box hover:shadow-lg transition-shadow">
                <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-row gap-2">
                        <div className="flex flex-row gap-1">
                            <CommunityIcon size={24} />
                            <h6 className="text-h6">
                                {post.comunidade.nome}
                            </h6>
                        </div>
                        <CodeIcon size={24} />
                        <div className="flex flex-row gap-1">
                            <h6 
                                className="text-h6 hover:cursor-pointer"
                                onClick={handleRedirectToProfile}
                            >
                                @{post.autor.username}
                            </h6>
                        </div>
                    </div>
                    {(isOwner || isModerator) && !disableActions && <div onClick={handleMoreOptions}>
                        <MoreHorizontalIcon size={24} />
                    </div>}
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

                <div className="flex flex-row items-end justify-between">
                    <div className="flex flex-row gap-1">
                        <Button 
                            text={String(likeAmount)}
                            colorScheme="light-brown" 
                            size="small"
                            icon={<HeartIcon fill={liked ? 'currentColor' : 'none'} strokeWidth={3} />}
                            disabled={disableActions || loading}
                            onClick={handleLikePost}
                        />
                        <Button 
                            text={String(post.comentarios.length)}
                            colorScheme="light-brown"
                            size="small"
                            icon={<CommentIcon strokeWidth={3} />}
                            disabled={disableActions || loading}
                            onClick={handleRedirectToPost}
                        />
                    </div>
                    <p className="text-b3 body-semibold light-neutral">
                        {getTimeAgo(post.createdAt)}
                    </p>
                </div>
            </div>
            <EditPostModal 
                post={post}
                onClose={() => setShowEditModal(false)}
                onSuccess={handleEditSuccess}
                isOpen={showEditModal && isOwner && !disableActions}
            />
            <PopUp 
                title={`Excluir Postagem${(!isOwner && isModerator) ? ` de ${post.autor.username}` : ''}?`}
                description="Esta ação não pode ser desfeita."
                button1={{text: "Cancelar", icon: <RemoveIcon />, colorScheme: "dark-brown", onClick: () => setShowConfirmDeletePopUp(false)}}
                button2={{text: "Excluir", icon: <TrashIcon />, colorScheme: "dark-green", onClick: handleDeletePost}}
                isOpen={(isOwner || isModerator) && showConfirmDeletePopUp && !disableActions}
                onClose={() => setShowConfirmDeletePopUp(false)}
            />
            <AnimatePresence mode="wait">
                {(isOwner || isModerator) && !disableActions && showOptions &&
                <motion.div 
                    ref={menuRef}
                    className="fixed z-50 flex flex-col flex-shrink-0 items-center small-padding medium-border-radius large-border-width border-[var(--secondary-700)] bg-gray-50 gap-1"
                    style={{
                        top: clickPosition.y,
                        left: clickPosition.x
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25 }}
                    onMouseLeave={() => setShowOptions(false)}
                >
                    <Button
                        text="Excluir"
                        icon={<TrashIcon />}
                        size="small"
                        colorScheme="light-brown"
                        onClick={handleConfirmDeletePost}
                        loading={loading}
                    />
                    {isOwner && <Button
                        text="Editar"
                        icon={<EditIcon />}
                        size="small"
                        colorScheme="light-brown"
                        onClick={handleEditPost}
                        disabled={loading}
                    />}
                </motion.div>}
            </AnimatePresence>
        </motion.div>
    )
}