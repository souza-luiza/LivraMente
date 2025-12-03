"use client";

import { useEffect, useState } from "react";
import PostComponent from "./post";
import Button from "./button";
import ChevronRightIcon from "./icons/ChevronRightIcon";
import { Post } from "@/types/post";
import { postsService } from "@/services/posts";
import { getSessionInfos } from "@/services/auth";
import { useRouter } from "next/navigation";

interface TrendingTopic {
    saga: string;
    hashtag: string;
    postCount: string;
}

interface FeedProps {
    showTrending?: boolean;
}

// Posts mockados para desenvolvimento
const mockPosts = [
    {
        _id: "1",
        conteudo: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        autor: {
            _id: "user1",
            username: "usuario",
            avatarUrl: "",
        },
        comunidade: {
            _id: "com1",
            nome: "Comunidade",
        },
        curtidas: ["user2", "user3"],
        comentarios: [],
        imagens: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        _id: "2",
        conteudo: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        autor: {
            _id: "user2",
            username: "usuario",
            avatarUrl: "",
        },
        comunidade: {
            _id: "com2",
            nome: "Comunidade",
        },
        curtidas: ["user1"],
        comentarios: [],
        imagens: [],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        _id: "3",
        conteudo: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        autor: {
            _id: "user3",
            username: "usuario",
            avatarUrl: "",
        },
        comunidade: {
            _id: "com3",
            nome: "Comunidade",
        },
        curtidas: [],
        comentarios: [],
        imagens: [],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        _id: "4",
        conteudo: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        autor: {
            _id: "user4",
            username: "usuario",
            avatarUrl: "",
        },
        comunidade: {
            _id: "com1",
            nome: "Comunidade",
        },
        curtidas: ["user1", "user2", "user3"],
        comentarios: [],
        imagens: [],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
    },
] as Post[];

export default function Feed({ showTrending = true }: FeedProps) {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string>("");
    const [loading, setLoading] = useState(true);

    // Trending Topics mockados
    const trendingTopics: TrendingTopic[] = [
        { saga: "Saga Qualquer", hashtag: "#Qualquer", postCount: "10.5k posts" },
        { saga: "Saga Qualquer", hashtag: "#Qualquer", postCount: "10.5k posts" },
        { saga: "Saga Qualquer", hashtag: "#Qualquer", postCount: "10.5k posts" },
        { saga: "Saga Qualquer", hashtag: "#Qualquer", postCount: "10.5k posts" },
        { saga: "Saga Qualquer", hashtag: "#Qualquer", postCount: "10.5k posts" },
        { saga: "Saga Qualquer", hashtag: "#Qualquer", postCount: "10.5k posts" },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const sessionInfo = await getSessionInfos();
                if (sessionInfo) {
                    setCurrentUserId(sessionInfo.userId);
                }

                // TODO: Substituir por chamada real ao serviço quando disponível
                // const feedPosts = await postsService.getFeedPosts();
                // setPosts(feedPosts);
                
                // Usando posts mockados por enquanto
                setPosts(mockPosts);
            } catch (error) {
                console.error("Erro ao carregar feed:", error);
                // Em caso de erro, usar posts mockados
                setPosts(mockPosts);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDeletePost = (postId: string) => {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
    };

    const handleUpdatePost = async () => {
        // TODO: Recarregar posts do feed após atualização
        // const feedPosts = await postsService.getFeedPosts();
        // setPosts(feedPosts);
    };

    const handleCommentClick = (postId: string) => {
        router.push(`/post/${postId}`);
    };

    if (loading) {
        return (
            <div className="w-full flex justify-center items-center py-8">
                <div className="w-8 h-8 border-4 border-[#B0CC9E] border-t-[#5C8046] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full flex flex-row gap-6 px-4">
            {/* Coluna de Posts */}
            <div className="flex-1 flex flex-col gap-4">
                {posts.length === 0 ? (
                    <div className="light-neutral medium-border-width medium-box text-center py-8">
                        <p className="text-b1 text-gray-500">
                            Nenhum post encontrado. Siga comunidades para ver posts aqui!
                        </p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <PostComponent
                            key={post._id}
                            post={post}
                            currentUserId={currentUserId}
                            handleComment={() => handleCommentClick(post._id)}
                            onDelete={() => handleDeletePost(post._id)}
                            onUpdate={handleUpdatePost}
                        />
                    ))
                )}
            </div>

            {/* Coluna de Trending Topics */}
            {showTrending && (
                <div className="w-90 flex-shrink-0">
                    <div className="bg-[var(--secondary-100)] medium-box sticky top-4">
                        <h4 className="text-h4 mb-4 pt-4 pb-4 text-center" style={{ color: "var(--secondary-800)" }}>
                            Trending Topics
                        </h4>
                        <div className="flex flex-col gap-3">
                            {trendingTopics.map((topic, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col bg-[var(--secondary-200)] p-2 rounded-lg cursor-pointer transition-colors"
                                >
                                    <span className="text-b3 text-[var(--secondary-600)]">
                                        {topic.saga} • Trending
                                    </span>
                                    <span
                                        className="text-h5"
                                        style={{ color: "var(--secondary-800)" }}
                                    >
                                        {topic.hashtag}
                                    </span>
                                    <span className="text-b3 text-[var(--secondary-500)]">
                                        {topic.postCount}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <Button
                                text="Explorar mais"
                                colorScheme="dark-brown"
                                size="medium"
                                icon={<ChevronRightIcon />}
                                path="/explorar"
                                fullwidth
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}