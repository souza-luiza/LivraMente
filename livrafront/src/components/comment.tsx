import { Comentario } from "@/types/comentario";
import CommentIcon from "./icons/CommentIcon";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import ImageModal from "./image-modal";
import { Post } from "@/types/post";
import Button from "./button";
import HeartIcon from "./icons/HeartIcon";
import { getTimeAgo } from "@/lib/time";
import { commentsService } from "@/services/comentarios";
import MoreHorizontalIcon from "./icons/MoreHorizontalIcon";
import EditIcon from "./icons/EditIcon";
import TrashIcon from "./icons/TrashIcon";
import { AnimatePresence, motion } from "framer-motion";
import RemoveIcon from "./icons/RemoveIcon";
import PopUp from "./pop-up";
import EditCommentModal from "./EditCommentModal";
import { useRouter } from "next/navigation";

interface CommentComponentProps {
    post: Post;
    comment: Comentario;
    currentUserId: string;
    isModerator?: boolean;
    onDelete: () => void;
    onUpdate?: () => void;
}

export default function CommentComponent({
    post,
    comment,
    currentUserId,
    isModerator = false,
    onDelete,
    onUpdate
} : CommentComponentProps) {

    const router = useRouter();

    // Gerenciamento do overflow do conteúdo do comentário
    const [isOverflowed, setIsOverflowed] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [maxHeight, setMaxHeight] = useState<string | undefined>(undefined);
    const contentRef = useRef<HTMLParagraphElement>(null);

    // Gerenciamento do modal de imagem
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);

    // Curtidas
    const [liked, setLiked] = useState(comment.curtidas.some((id) => id === currentUserId));
    const [likeAmount, setLikeAmount] = useState(comment.curtidas.length);

    // Mais Opções
    const [showOptions, setShowOptions] = useState(false);
    const [clickPosition, setClickPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [showConfirmDeletePopUp, setShowConfirmDeletePopUp] = useState(false);
    const [showEditCommentModal, setShowEditCommentModal] = useState(false);

    const isOwner = (comment.autor._id === currentUserId);

    useEffect(() => {
        if (contentRef.current) {
            const el = contentRef.current;
            const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
            const maxVisibleHeight = lineHeight * 4;
            setMaxHeight(expanded ? `${el.scrollHeight}px` : `${maxVisibleHeight}px`);
            setIsOverflowed(el.scrollHeight > maxVisibleHeight);
        }
    }, [comment.conteudo, expanded]);

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

    const handleOpenImageModal = (imgUrl: string) => {
        setSelectedImage(imgUrl);
        setShowImageModal(true);
    }

    const handleLikeComment = async () => {
        try {
            const { liked, likeAmount } = await commentsService.likeComment(post._id, comment._id);
            
            setLiked(liked);
            setLikeAmount(likeAmount);

        } catch (error) {
            console.error("Erro ao curtir/descurtir o comentário:", error);
        }
    }

    const handleMoreOptions = (e: React.MouseEvent) => {
        e.stopPropagation();

        setClickPosition({ x: e.clientX, y: e.clientY });
        setShowOptions(true);
    }

    const handleConfirmDeleteComment = () => {
        setShowOptions(false);
        setShowConfirmDeletePopUp(true);
    }

    const handleDeleteComment = async () => {
        try {
            await commentsService.deleteComment(post._id, comment._id);

        } catch (error) {
            console.error("Erro ao excluir o comentário:", error);

        } finally {
            onDelete && onDelete();
            setShowConfirmDeletePopUp(false);
        }
    }
    const handleShowEditCommentModal = () => {
        setShowOptions(false);
        setShowEditCommentModal(true);
    }

    const handleEditSuccess = () => {
        setShowEditCommentModal(false);
        onUpdate && onUpdate();
    }

    const handleRedirectToProfile = () => {
        router.push(`/${comment.autor.username}`);
    }

    return (
        <motion.div onHoverEnd={() => setShowOptions(false)}>
            <div className="flex flex-col gap-3 medium-box light-neutral shadow-sm hover:shadow-md">
                {/*Cabeçalho do Comentário*/}
                <div className="flex flex-row justify-between">
                    <div 
                        className="flex flex-row gap-1 hover:cursor-pointer"
                        onClick={handleRedirectToProfile}
                    >
                        <Image
                            src={comment.autor.avatarUrl ? comment.autor.avatarUrl : '/AbstractUser.png'}
                            alt="Foto do usuário"
                            width={24}
                            height={24}
                            className="rounded-full object-cover"
                        />
                        <h6 className="text-h6">
                            @{comment.autor.username}
                        </h6>
                    </div>
                    {(isOwner || isModerator) && <div onClick={handleMoreOptions}>
                        <MoreHorizontalIcon size={24} />
                    </div>}
                </div>

                {/*Corpo do Comentário*/}
                <div className="flex-1 overflow-hidden">
                    <p
                        ref={contentRef}
                        style={{ maxHeight, overflow: 'hidden', transition: 'max-height 0.3s ease', wordBreak: 'break-word', overflowWrap: 'break-word' }}
                        className="text-b2 whitespace-pre-line"
                    >
                        {comment.conteudo}
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
                {comment.imagens && comment.imagens.length > 0 && (
                <div className="flex flex-nowrap gap-2 overflow-x-auto">
                    {comment.imagens.map((imgUrl, index) => (
                    <div 
                        key={index} 
                        className="relative w-32 h-32 medium-border-radius overflow-hidden cursor-pointer"
                        onClick={() => handleOpenImageModal(imgUrl)}
                    >
                        <Image
                            src={imgUrl}
                            alt={`Imagem do comentário ${index + 1}`}
                            fill
                            className="object-cover"
                        />
                    </div>
                    ))}
                </div>
                )}

                {showImageModal && selectedImage && (
                <ImageModal
                    autor={comment.autor.username}
                    imagem={selectedImage} 
                    imagens={comment.imagens}
                    onClose={() => setShowImageModal(false)} 
                />
                )}

                <div className="flex flex-row items-end justify-between">
                    <Button 
                        text={String(likeAmount)}
                        colorScheme="light-brown" 
                        size="small"
                        icon={<HeartIcon fill={liked ? 'currentColor' : 'none'} strokeWidth={3} />}
                        onClick={handleLikeComment}
                    />
                    <p className="text-b3 body-semibold light-neutral">
                        {getTimeAgo(comment.createdAt)}
                    </p>
                </div>
            </div>
            <EditCommentModal
                post={post}
                comment={comment}
                isOpen={isOwner && showEditCommentModal}
                onClose={() => setShowEditCommentModal(false)}
                onSuccess={handleEditSuccess}
            />
            <PopUp 
                title={`Excluir Comentário${(!isOwner && isModerator) ? ` de @${comment.autor.username}` : ''}?`}
                description="Esta ação não pode ser desfeita."
                button1={{text: "Cancelar", icon: <RemoveIcon />, colorScheme: "light-green", onClick: () => setShowConfirmDeletePopUp(false)}}
                button2={{text: "Excluir", icon: <TrashIcon />, colorScheme: "light-brown", onClick: handleDeleteComment}}
                isOpen={(isOwner || isModerator) && showConfirmDeletePopUp}
                onClose={() => setShowConfirmDeletePopUp(false)}
            />
            <AnimatePresence mode="wait">
                {(isOwner || isModerator) && showOptions &&
                <motion.div 
                    ref={menuRef}
                    className="fixed z-50 flex flex-col flex-shrink-0 items-center medium-box small-border-width border-gray-300 shadow-md bg-white gap-1"
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
                        colorScheme="dark-brown"
                        onClick={handleConfirmDeleteComment}
                        fullwidth={true}
                    />
                    {isOwner && <Button
                        text="Editar"
                        icon={<EditIcon />}
                        size="small"
                        colorScheme="dark-brown"
                        onClick={handleShowEditCommentModal}
                        fullwidth={true}
                    />}
                </motion.div>}
            </AnimatePresence>
        </motion.div>
    );
}