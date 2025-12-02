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
import { toast } from "react-toastify";
import { resenhasService } from "@/services/resenhas";
import ResenhaModal from "./resenha-modal";
import Rating from '@mui/material/Rating';

interface ReviewComponentProps {
    // resenha:
    bookId: string;
    resenhaId: string;
    currentUserId?: string;
    onDelete: () => void;
    onUpdate?: () => void;
}

export default function ReviewComponent({
    bookId,
    resenhaId,
    currentUserId,
    onDelete,
    onUpdate
} : ReviewComponentProps) {

    const router = useRouter();

    // Estado da resenha
    const [review, setReview] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Gerenciamento do overflow do conteúdo do comentário
    const [isOverflowed, setIsOverflowed] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [maxHeight, setMaxHeight] = useState<string | undefined>(undefined);
    const contentRef = useRef<HTMLParagraphElement>(null);

    // Spoilers
    const [spoilerRevealed, setSpoilerRevealed] = useState(false);

    // Mais Opções
    const [showOptions, setShowOptions] = useState(false);
    const [clickPosition, setClickPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [showConfirmDeletePopUp, setShowConfirmDeletePopUp] = useState(false);
    const [showEditCommentModal, setShowEditCommentModal] = useState(false);
    const [showEditResenhaModal, setShowEditResenhaModal] = useState(false);

    // TODO: Mudar
    // const isOwner = true;

    // buscar dados da resenha
    useEffect(() => {
        async function fetchResenha() {
            try {
                const data = await resenhasService.getResenha(resenhaId);
                setReview(data);
            } catch (error) {
                toast.error("Erro ao carregar resenha.");
            } finally {
                setLoading(false);
            }
        }
        fetchResenha();
    }, [resenhaId]);

    // verificar se é o dono da resenha
    const isOwner = currentUserId === review?.autor?._id;

    // TODO: Verificar se a resenha foi editada
    // const edited = (review.createdAt !== resenha.updatedAt);
    const edited = review?.createdAt !== review?.updatedAt;

    useEffect(() => {
        if (contentRef.current) {
            const el = contentRef.current;
            const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
            const maxVisibleHeight = lineHeight * 4;
            setMaxHeight(expanded ? `${el.scrollHeight}px` : `${maxVisibleHeight}px`);
            setIsOverflowed(el.scrollHeight > maxVisibleHeight);
        }
    }, [expanded, review]);

    useEffect(() => {
        if (showOptions && menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            const menuWidth = rect.width;

            setClickPosition((prev) => {
                let x = prev.x - menuWidth;
                let y = prev.y + 10;

                return { x, y };
            });
        }
    }, [showOptions]);

    const handleMoreOptions = (e: React.MouseEvent) => {
        e.stopPropagation();

        setClickPosition({ x: e.clientX, y: e.clientY });
        setShowOptions(true);
    }

    const handleConfirmDeleteReview = () => {
        setShowOptions(false);
        setShowConfirmDeletePopUp(true);
    }

    const handleDeleteReview = async () => {
        try {
            await resenhasService.removeResenha(resenhaId);
        } catch (error) {
            toast.error("Erro ao excluir resenha.");

        } finally {
            onDelete && onDelete();
            setShowConfirmDeletePopUp(false);
        }
    }
    const handleShowEditReviewModal = () => {
        setShowOptions(false);
        setShowEditResenhaModal(true);
    }

    const handleEditSuccess = () => {
        setShowEditResenhaModal(false);
        onUpdate && onUpdate();
    }

    const handleRedirectToProfile = () => {
        if (review?.autor?.username) {
            router.push(`/${review.autor.username}`);
        }
    }

    if (loading || !review) {
        return (
            <div className="flex flex-col gap-3 medium-box light-neutral shadow-sm">
                <p className="text-b2 body-quotation">Carregando...</p>
            </div>
        );
    }

    return (
        <>
        <motion.div onHoverEnd={() => setShowOptions(false)}>
            <div className="flex flex-col gap-3 medium-box light-neutral shadow-sm hover:shadow-md">
                {/*Cabeçalho do Comentário*/}
                <div className="flex flex-row justify-between">
                    <div 
                        className="flex flex-row gap-1 hover:cursor-pointer"
                        onClick={handleRedirectToProfile}
                    >
                        <Image
                            src={review.autor.avatarUrl ? review.autor.avatarUrl : '/AbstractUser.png'}
                            alt="Foto do usuário"
                            width={24}
                            height={24}
                            className="rounded-full object-cover"
                        />
                        <h6 className="text-h6">
                            @{review.autor.username}
                        </h6>
                    </div>
                    {isOwner && <div onClick={handleMoreOptions}>
                        <MoreHorizontalIcon size={24} />
                    </div>}
                </div>

                {/*Avaliação*/}
                <div className="flex items-center gap-2">
                    <Rating
                        name="review-rating"
                        value={review.avaliacao}
                        readOnly
                        precision={1.0}
                        size="small"
                    />
                    <span className="text-b2 body-semibold">{review.avaliacao.toFixed(1)}</span>
                </div>

                {/*Corpo do Comentário*/}
                <div className="flex-1 overflow-hidden">
                    <div className="relative">
                        <p
                            ref={contentRef}
                            style={{ maxHeight, overflow: 'hidden', transition: 'max-height 0.3s ease', wordBreak: 'break-word', overflowWrap: 'break-word' }}
                            className="text-b2 whitespace-pre-line"
                        >
                            {review.conteudo}
                        </p>
                        {review.spoiler && !spoilerRevealed && (
                            <div 
                                className="absolute inset-0 bg-gray-400 hover:bg-gray-500 transition-colors cursor-pointer flex items-center justify-center"
                                onClick={() => setSpoilerRevealed(true)}
                            >
                                <span className="text-b2 body-semibold text-white">Cuidado! Essa resenha contém spoilers.</span>
                            </div>
                        )}
                    </div>
                    {isOverflowed && (
                        <span
                            className="text-b2 body-semibold text-[var(--primary-700)] hover:cursor-pointer"
                            onClick={() => setExpanded(prev => !prev)}
                        >
                            {expanded ? "Ver menos..." : "Ver mais..."}
                        </span>
                    )}
                </div>

                <div className="flex justify-end">
                    <p className="text-b3 body-semibold light-neutral">
                        {getTimeAgo(review.createdAt)}{edited ? ' (editado)' : ''}
                    </p>
                </div>
            </div>
            <ResenhaModal
                isOpen={isOwner && showEditResenhaModal}
                onClose={() => setShowEditResenhaModal(false)}
                bookId={bookId}
                resenhaId={resenhaId}
                onSuccess={handleEditSuccess}
            />
            <PopUp 
                title={`Excluir Comentário${!isOwner ? ` de @${review.autor.username}` : ''}?`}
                description="Esta ação não pode ser desfeita."
                button1={{text: "Cancelar", icon: <RemoveIcon />, colorScheme: "light-green", onClick: () => setShowConfirmDeletePopUp(false)}}
                button2={{text: "Excluir", icon: <TrashIcon />, colorScheme: "light-brown", onClick: handleDeleteReview}}
                isOpen={isOwner && showConfirmDeletePopUp}
                onClose={() => setShowConfirmDeletePopUp(false)}
            />
            <AnimatePresence mode="wait">
                {isOwner && showOptions &&
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
                        onClick={handleConfirmDeleteReview}
                        fullwidth={true}
                    />
                    {isOwner && <Button
                        text="Editar"
                        icon={<EditIcon />}
                        size="small"
                        colorScheme="dark-brown"
                        onClick={handleShowEditReviewModal}
                        fullwidth={true}
                    />}
                </motion.div>}
            </AnimatePresence>
        </motion.div>
        </>
    );
}