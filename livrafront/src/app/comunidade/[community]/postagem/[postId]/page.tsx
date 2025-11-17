"use client";

import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/sidebar";
import SearchBar from "@/components/searchbar";
import { useState, useEffect, useRef } from "react";
import { communityService } from "@/services/comunidade";
import { slugToTitle } from "@/lib/slugify";
import { Comunidade } from "@/types/comunidade";
import { postsService } from "@/services/posts";
import { Post } from "@/types/post";
import { Comentario, CreateCommentData } from "@/types/comentario";
import LoadingPage from "@/components/loading";
import PostComponent from "@/components/post";
import CommentComponent from "@/components/comment";
import Button from "@/components/button";
import ImageIcon from "@/components/icons/ImageIcon";
import CommentIcon from "@/components/icons/CommentIcon";
import { commentsService } from "@/services/comentarios";
import Image from "next/image";
import TrashIcon from "@/components/icons/TrashIcon";

export default function PostPage() {
    const router = useRouter();
    const params = useParams();
    const { community, postId } = params as { community: string, postId: string }

    const [loading, setLoading] = useState(true);
    const [communityInfo, setCommunityInfo] = useState<Comunidade>()
    const [postInfo, setPostInfo] = useState<Post>()
    const [comments, setComments] = useState<Comentario[]>([])
    const [isModerator, setIsModerator] = useState(false);

    // Função Comentar
    const [commentData, setCommentData] = useState<CreateCommentData>({ conteudo: "", imagens: [] })
    const [isSendingComment, setIsSendingComment] = useState(false);    
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!community || !postId) {
            router.replace("/not-found");
            return;
        }

        const fetchData = async () => {
            try {
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
                setLoading(false);
            }
        }

        fetchData();
    }, [community, postId, router])

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
            const updatedComments = await postsService.getComments(postInfo._id);
            console.log(updatedComments);
            setComments(updatedComments);

            setCommentData({ conteudo: "", imagens: [] });

        } catch (err) {
            console.error("Erro ao enviar comentário:", err);

        } finally {
            setIsSendingComment(false);
        }
    };

    const handleRefreshComments = async () => {
        if (!postInfo) return;

        try {
            const comments = await postsService.getComments(postInfo._id);
            setComments(comments);

        } catch (erro) {
            console.error("Erro ao enviar comentário:", erro);

        }
    }

    if (loading) return <LoadingPage />;
    if (!communityInfo || !postInfo) return null;

    return (
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
                        <div className="flex flex-col overflow-y-auto gap-2">
                            {/*Post*/}
                            <div className="flex flex-col">
                                <PostComponent
                                    post={postInfo}
                                    handleComment={handleComment}
                                    isModerator={isModerator}
                                    disableActions={loading}
                                />
                                {/*Seção de Comentários*/}
                                {(comments === undefined || comments.length === 0) ? (
                                    <p className="text-b1 body-quotation text-center pt-4">
                                        Nenhum comentário ainda.
                                    </p>
                                ) : (
                                    <div className="flex flex-col my-2">
                                        {comments.map((comment) => (
                                            <CommentComponent
                                                key={comment._id}
                                                post={postInfo}
                                                comment={comment}
                                                isModerator={isModerator}
                                                onDelete={handleRefreshComments}
                                                onUpdate={handleRefreshComments}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/*Filtro dos Comentários*/}
                        </div>
                        {/*Input - Comentar*/}
                        <div
                            className="sticky bottom-0 py-2 bg-white"
                            style={{ borderTopWidth: '1px', borderTopColor: '#E0E0E0' }}
                        >
                            <div className="flex flex-row items-end justify-between medium-box small-border-width border-gray-200 hover:border-gray-300 gap-2">
                                <div className="w-full h-full flex flex-col gap-2">
                                    <textarea
                                        ref={textareaRef}
                                        value={commentData?.conteudo}
                                        onChange={handleTextareaChange}
                                        placeholder={`Comente o post de @${postInfo.autor.username}`} 
                                        className="w-full h-fill resize-none overflow-y-auto text-b2 outline-none"
                                        style={{ maxHeight: "100px" }}
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
                                            disabled={commentData.imagens.length >= 4}
                                            style={{ display: "none" }}
                                        />
                                        <Button
                                            icon={<ImageIcon />}
                                            colorScheme="light-green"
                                            size="medium"
                                            tooltip="Adicionar Imagens"
                                            aria-label="Adicionar Imagens"
                                            onClick={handleImageButtonClick}
                                            disabled={isSendingComment || commentData.imagens.length >= 4}
                                        />
                                    </div>
                                    <Button
                                        icon={<CommentIcon />}
                                        colorScheme="light-green"
                                        size="medium"
                                        tooltip="Comentar"
                                        onClick={handleSendComment}
                                        disabled={isSendingComment || !commentData.conteudo.trim()}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/*Seção Direita - Recomendações, Chatbot etc...*/}
                    <div className="w-1/4 max-h-screen flex items-center justify-center medium-box bg-gray-100">
                        <p className="text-b1 body-quotation">
                            Em breve....
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}