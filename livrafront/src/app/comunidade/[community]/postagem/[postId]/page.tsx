"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

// Funções Auxiliares
import { slugToTitle } from "@/lib/slugify";
import { ChatProvider } from '@/contexts/chat-context';

// Integração com a API
import { communityService } from "@/services/comunidade";
import { postsService } from "@/services/posts";
import { commentsService } from "@/services/comentarios";
import { getSessionInfos } from "@/services/auth";

// Types
import { Post } from "@/types/post";
import { Comunidade } from "@/types/comunidade";
import { Comentario, CreateCommentData } from "@/types/comentario";
import { User } from "@/types/auth";

// Componentes
import Sidebar from "@/components/sidebar";
import SearchBar from "@/components/searchbar";
import LoadingPage from "@/components/loading";
import PostComponent from "@/components/post";
import CommentComponent from "@/components/comment";
import Button from "@/components/button";
import LoadingComponent from "@/components/portable-loading";
import DropdownFilter from "@/components/filter";
import WidgetChat from '@/components/widget-chat';

// Ícones
import ImageIcon from "@/components/icons/ImageIcon";
import CommentIcon from "@/components/icons/CommentIcon";
import TrashIcon from "@/components/icons/TrashIcon";
import ClockIcon from "@/components/icons/ClockIcon";
import PillarIcon from "@/components/icons/PillarIcon";
import StarIcon from "@/components/icons/StarIcon";

export default function PostPage() {
    const router = useRouter();
    const params = useParams();
    const { community, postId } = params as { community: string, postId: string }

    // Dados principais
    const [loading, setLoading] = useState(true);
    const [isModerator, setIsModerator] = useState(false);
    const [communityInfo, setCommunityInfo] = useState<Comunidade>()
    const [postInfo, setPostInfo] = useState<Post>()
    const [userInfo, setUserInfo] = useState<User>();
    const [comments, setComments] = useState<Comentario[]>([])

    // Dados dos comentários
    const [commentData, setCommentData] = useState<CreateCommentData>({ conteudo: "", imagens: [] })
    
    // Criação de comentários
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Carregamento de comentários
    const [isSendingComment, setIsSendingComment] = useState(false);    
    const [loadingComments, setLoadingComments] = useState(true);

    // Filtro de comentários
    const filters = ["Mais Recentes", "Mais Antigos", "Mais Populares"];
    const [currentFilter, setCurrentFilter] = useState(filters[0]);

    useEffect(() => {
        if (!community || !postId) {
            router.replace("/not-found");
            return;
        }

        const fetchData = async () => {
            try {
                // Busca informações do usuário
                const user = await getSessionInfos();
                setUserInfo(user);

                // Busca Comunidade
                const communityName = slugToTitle(community);
                const communityInfo = await communityService.getComunidadeByName(communityName);
                if (!communityInfo) {
                    router.replace("/not-found");
                    return;
                }
                setCommunityInfo(communityInfo);

                // Busca Post
                const postInfo = await postsService.getPostById(postId, communityInfo.nome);
                if (!postInfo) {
                    router.replace("/not-found");
                    return;
                }
                setPostInfo(postInfo);

                // Busca Comentários
                const comments = await postsService.getComments(postInfo._id);
                setComments(comments);

                // Verifica se usuário é moderador da comunidade
                const { isMember, isModerator } = await communityService.checkMemberOrMod(communityInfo.nome);
                setIsModerator(isModerator);

            } catch (err) {

                console.error("Erro ao carregar post:", err);
                router.replace("/not-found");

            } finally {
                setLoadingComments(false);
                setLoading(false);
            }
        }

        fetchData();
    }, [community, postId, router])

    useEffect(() => {
        setComments((prev) => sortComments(prev));
        handleRefreshComments();
    }, [currentFilter]);

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const el = textareaRef.current;

        setCommentData(prev => ({
            ...prev,
            conteudo: e.target.value
        }));

        if (!el) return;

        el.style.height = "auto";
        const maxHeight = 100;
        el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
    };

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

                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 1200;
                let width = img.width;
                let height = img.height;

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
            const remainingSlots = 4 - commentData.imagens.length;
            const filesToProcess = Array.from(files).slice(0, remainingSlots);

            Promise.all(filesToProcess.map(compressImage))
                .then((newImages) => {
                setCommentData({ conteudo: commentData.conteudo, imagens: [...commentData.imagens, ...newImages] });
                });
        }
    };

    const removeImage = (index: number) => {
        setCommentData({conteudo: commentData.conteudo, imagens: commentData.imagens.filter((_, i) => i !== index)});
    };

    const handleImageButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleComment = () => {
        textareaRef.current?.focus();
    }

    const handleSendComment = async () => {
        if (!commentData || !postInfo) return;

        try {
            setIsSendingComment(true);

            // Criar comentário
            await commentsService.createComment(postInfo._id, commentData);
            
            // Recarregar comentários
            handleRefreshComments();

            setCommentData({ conteudo: "", imagens: [] });

            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }

        } catch (err) {
            console.error("Erro ao enviar comentário:", err);

        } finally {
            setIsSendingComment(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.key === "Enter") && (!e.shiftKey)) {
            e.preventDefault();
            handleSendComment();
        }
    }

    const handleRefreshComments = async () => {
        if (!postInfo) return;
        
        try {
            setLoadingComments(true);

            const comments = await postsService.getComments(postInfo._id);
            setComments(sortComments(comments));

        } catch (erro) {
            console.error("Erro ao enviar comentário:", erro);

        } finally {
            setLoadingComments(false);
        }
    }

    const sortComments = (commentsToSort: Comentario[]) => {
        const sorted = [...commentsToSort].sort((a, b) => {
            if (currentFilter === "Mais Antigos") {
                return Date.parse(a.createdAt) - Date.parse(b.createdAt);
            }
            if (currentFilter === "Mais Recentes") {
                return Date.parse(b.createdAt) - Date.parse(a.createdAt);
            }
            if (currentFilter === "Mais Populares") {
                return b.curtidas.length - a.curtidas.length;
            }
            return 0;
        });

        return sorted;
    };

    if (loading) return <LoadingPage />;
    if (!communityInfo || !postInfo || !userInfo) return null;

    return (
        <ChatProvider>
        <div className="min-h-screen flex bg-[#FFFFFF]">
            {/*Barra Lateral Fixa*/}
            <Sidebar />

            <div className="w-full flex flex-col">
                {/*Barra de Busca*/}
                <SearchBar />

                {/*Conteúdo Principal da Página*/}
                <main className="w-full h-full flex flex-row pl-2 pr-4 pt-2 gap-4">
                    {/*Seção Esquerda - Post*/}
                    <div className="w-3/4 flex flex-col h-full light-neutral justify-between">
                        <div className="flex flex-col gap-2 mx-1">
                            {/*Post*/}
                            <PostComponent
                                post={postInfo}
                                currentUserId={userInfo.userId}
                                handleComment={handleComment}
                                isModerator={isModerator}
                                disableActions={loading || isSendingComment}
                            />
                            {/*Seção de Comentários*/}
                            <div className="flex flex-row justify-between">
                                <div className="flex flex-row items-center medium-box dark-brown gap-1">
                                    <CommentIcon size={20} />
                                    <h6 className="text-h6">Comentários</h6>
                                </div>
                                {/*Filtro*/}
                                <DropdownFilter
                                    filters={filters}
                                    filterIcons={[
                                        <ClockIcon key="filter-clock" />,
                                        <PillarIcon key="filter-pillar" />,
                                        <StarIcon key="filter-star" />,
                                    ]}
                                    currentFilter={currentFilter}
                                    onChange={setCurrentFilter}
                                    size="medium"
                                    colorScheme="dark-brown"
                                />
                            </div>  
                            {loadingComments ? (
                                <LoadingComponent 
                                    size="small"
                                    className="p-8"
                                />
                            ) : (comments === undefined || comments.length === 0) ? (
                                <p className="text-b1 body-quotation text-center pt-4">
                                    Nenhum comentário ainda.
                                </p>
                            ) : (
                                <div className="flex flex-col gap-1">
                                    {comments.map((comment) => (
                                        <CommentComponent
                                            key={comment._id}
                                            post={postInfo}
                                            currentUserId={userInfo.userId}
                                            comment={comment}
                                            isModerator={isModerator}
                                            onDelete={handleRefreshComments}
                                            onUpdate={handleRefreshComments}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        {/*Input - Comentar*/}
                        <div
                            className="sticky bottom-0 py-2 z-40"
                            style={{ borderTopWidth: '1px', borderTopColor: '#E0E0E0', backgroundColor: '#FFFFFF' }}
                        >
                            <div className="flex flex-row items-end justify-between medium-box small-border-width border-gray-200 hover:border-gray-300 gap-2">
                                <div className="w-full h-full flex flex-col gap-2">
                                    <textarea
                                        ref={textareaRef}
                                        value={commentData?.conteudo}
                                        onChange={handleTextareaChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder={`Comente no post de @${postInfo.autor.username}`} 
                                        className="w-full h-fill resize-none overflow-y-auto text-b2 outline-none"
                                        style={{ maxHeight: "100px" }}
                                        disabled={loading || isSendingComment || loadingComments}
                                    />
                                    {/*Imagens*/}
                                    {commentData.imagens.length > 0 && (
                                    <div className="flex flex-row gap-2">
                                    {commentData.imagens.map((image, index) => (
                                        <div
                                            key={index}
                                            className="w-16 h-16 relative overflow-hidden group"
                                            style={{
                                                aspectRatio: '1',
                                                borderRadius: 'var(--small-border-radius)',
                                            }}
                                            >
                                            <Image
                                                src={image}
                                                alt={`Preview ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                            {/* Botão para remover imagem */}
                                            <div className="absolute top-[0.9] right-[0.9] opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    icon={<TrashIcon />}
                                                    colorScheme="dark-brown"
                                                    size="small"
                                                    onClick={() => removeImage(index)}
                                                    aria-label="Remover imagem"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    </div>
                                    )}
                                </div>
                                <div className="flex flex-row gap-1">
                                    <div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"  
                                            multiple
                                            onChange={handleImageChange}
                                            disabled={loading || isSendingComment || loadingComments || commentData.imagens.length >= 4}
                                            style={{ display: "none" }}
                                        />
                                        <Button
                                            icon={<ImageIcon />}
                                            colorScheme="light-green"
                                            size="medium"
                                            tooltip="Adicionar Imagens"
                                            aria-label="Adicionar Imagens"
                                            onClick={handleImageButtonClick}
                                            disabled={loading || isSendingComment || loadingComments || commentData.imagens.length >= 4}
                                        />
                                    </div>
                                    <Button
                                        icon={<CommentIcon />}
                                        colorScheme="light-green"
                                        size="medium"
                                        tooltip="Comentar"
                                        onClick={handleSendComment}
                                        disabled={loading || isSendingComment || loadingComments || !commentData.conteudo.trim()}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/*Seção Direita - Recomendações, Chatbot etc...*/}
                    <div className="sticky top-16 w-1/4 max-h-screen flex items-center justify-center medium-box bg-gray-100">
                        <p className="text-b1 body-quotation">
                            Em breve....
                        </p>
                    </div>
                </main>
            </div>
            <WidgetChat embedded={true} />
        </div>
        </ChatProvider>
    );
}