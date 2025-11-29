"use client";

import LivrosReadlist from "@/components/livros-readlist";
import SearchBar from "@/components/searchbar";
import Sidebar from "@/components/sidebar";
import Image from "next/image";
import Button from "@/components/button";
import Edit2Icon from "@/components/icons/Edit2Icon";
import HeartIcon from "@/components/icons/HeartIcon";
import OpenBookIcon from "@/components/icons/OpenBookIcon";
import TrashIcon from "@/components/icons/TrashIcon";
import { useEffect, useState } from "react";
import { Readlist } from "@/types/readlist";
import { notFound, useParams, useRouter } from "next/navigation";
import { getSessionInfos } from "@/services/auth";
import { checkReadlistFav, deleteReadlist, favoriteReadlist, getOnePublicReadlist, getReadlistBySlug, removeBookFromReadlist, unfavoriteReadlist, updateReadlist } from "@/services/readlists";
import { toast } from "react-toastify";
import ToastNotification from '@/components/toast-notification';
import LoadingPage from "@/components/loading";
import EditReadlistModal from "@/components/EditReadlistModal";
import AddBook from "@/components/add-book";
import PopUp from "@/components/pop-up";
import RemoveIcon from "@/components/icons/RemoveIcon";
import { getProfile } from "@/services/userService";
import { UserProfile } from "@/types/users";
import LoadingComponent from "@/components/portable-loading";

export default function ReadlistPage() {
    const router = useRouter();
    const params = useParams();
    const username = params.username as string;
    const readlistSlug = params.readlistSlug as string;

    const [isOwner, setIsOwner] = useState(true);
    const [readlistInfo, setReadlistInfo] = useState<Readlist>();
    const [ownerInfo, setOwnerInfo] = useState<UserProfile>();

    const [isFavorited, setIsFavorited] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingBooks, setLoadingBooks] = useState(false);
    
    // Edit Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Componente de adicionar livro
    const [isAddBookOpen, setIsAddBookOpen] = useState(false);

    // Pop-up para confirmar delete 
    const [showConfirmDeletePopUp, setShowConfirmDeletePopUp] = useState(false);

    useEffect(() => {
        if(!readlistSlug) notFound();

        const fetchInfo = async () => {
            try {

                // Verificar se user esta autenticado
                const user = await getSessionInfos();
                const currentUsername = user.username;

                if(!user) {
                    router.replace("/entrar");
                    return;
                }

                // Verifica se user logado eh o dono:
                const isUserOwner = currentUsername === username;
                setIsOwner(isUserOwner);
            
                const foundReadlist = isUserOwner ? await getReadlistBySlug(readlistSlug) : await getOnePublicReadlist(username, readlistSlug);

                if(!foundReadlist) notFound();

                setReadlistInfo(foundReadlist);

                if(!isUserOwner) {
                    // Verifica se readlist eh favoritada por user
                    try {
                        const { isFavorited } = await checkReadlistFav(foundReadlist._id);
                        setIsFavorited(isFavorited);
                        const userInfo = await getProfile(username);
                        setOwnerInfo(userInfo);
                    }
                    catch(error) {
                        toast.error('Erro ao verificar se readlist está favoritada.');
                    }
                } else {
                    setOwnerInfo(user);
                }

            } catch(error) {
                toast.error('Erro ao carregar dados da readlist');
            } finally {
                setLoading(false);
            }
        };

        fetchInfo();
    }, [readlistSlug, username, router]);

    const handleRemoveBook = async (targetBookId: string) => {
        if (!readlistInfo || !isOwner || !targetBookId) return;

        setLoadingBooks(true);

        try {
            // Remove livro da readlist
            await removeBookFromReadlist(readlistInfo._id, targetBookId);

            // Atualiza dados da readlist
            const updatedReadlist = isOwner ? await getReadlistBySlug(readlistSlug) : await getOnePublicReadlist(username, readlistSlug);
            setReadlistInfo(updatedReadlist);

        } catch (err) {

            toast.error("Erro ao remover livro da readlist.");

        } finally {

            setLoadingBooks(false);

        }
    };

    const handleFavoritar = async () => {
        if (!readlistInfo || isOwner) return;

        try {
            if (isFavorited) {
                await unfavoriteReadlist(username, readlistSlug);
                setIsFavorited(false);
            } else {
                await favoriteReadlist(username, readlistSlug);
                setIsFavorited(true);
            }
        } catch (err) {
            toast.error('Erro ao favoritar readlist.');
        }
    };

    const handleSaveReadlist = async (data: {
        title: string;
        description: string;
        coverImage: string;
        isPrivate: boolean;
    }) => {
        if (!readlistInfo) return;

        try {
            // Atualizar via API
            await updateReadlist(readlistSlug, {
                nome: data.title,
                descricao: data.description,
                publica: !data.isPrivate,
            });

            // Atualizar estado local após salvar
            setReadlistInfo({
                ...readlistInfo,
                nome: data.title,
                descricao: data.description,
                capa_url: data.coverImage,
                publica: !data.isPrivate,
            });
        } catch (err) {
            toast.error('Erro ao atualizar readlist.');
        }
    };

    const handleRefreshBooks = async () => {
        if (!readlistInfo || !isOwner ) return;

        setLoadingBooks(true);

        try {
            // Atualiza dados da readlist
            const updatedReadlist = isOwner ? await getReadlistBySlug(readlistSlug) : await getOnePublicReadlist(username, readlistSlug);
            setReadlistInfo(updatedReadlist);

        } catch (err) {
            toast.error("Erro ao adicionar livro na readlist.");

        } finally {
            setLoadingBooks(false);
        }
    }

    const handleDeleteReadlist = async () => {
        setLoading(true);

        try {
            await deleteReadlist(readlistSlug);
            setShowConfirmDeletePopUp(false);
            router.push(`/${username}/readlists`);

        } catch (err) {
            toast.error('Erro ao apagar readlist.');

        }
    }

    if(loading) return <LoadingPage />;
    if(!readlistInfo || !ownerInfo) return notFound();

    return (
        <div className="min-h-screen flex bg-[#FFFFFF]">
            {/* Modal de Edição */}
            <EditReadlistModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                readlist={{
                    title: readlistInfo.nome,
                    description: readlistInfo.descricao || '',
                    coverImage: readlistInfo.capa_url || '',
                    isPrivate: !readlistInfo.publica,
                }}
                onSave={handleSaveReadlist}
            />

            <AddBook
                isOpen={isAddBookOpen}
                onClose={() => setIsAddBookOpen(false)}
                readlistId={readlistInfo._id}
                onSave={handleRefreshBooks}
                livrosReadlist={readlistInfo.livros}
            />

            {/*Sidebar*/}
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <SearchBar />

                <div className="w-full flex gap-4 p-4">
                    <div className="flex flex-col gap-2 items-center">
                        <main className="bg-[#E8DDD4] w-[240px] h-fit flex flex-col medium-border-radius p-5 gap-2 text-[var(--secondary-700)]">
                            <div className="relative w-full aspect-[1/1]">
                                <Image 
                                    src={readlistInfo.capa_url || "/ReadlistDefault.png"}
                                    alt={"Foto da readlist"}
                                    fill
                                    className="object-cover rounded-lg" 
                                />
                            </div>
                            <h3 className="text-h3 text-center break-words">{readlistInfo.nome}</h3>
                            <div className="flex flex-row justify-center items-center gap-1">
                                <Image 
                                    src={ownerInfo.avatarUrl || "/AbstractUser.png"}
                                    alt="Foto do dono da readlist"
                                    width={24}
                                    height={24}
                                    className="rounded-full object-cover"
                                />
                                <p className="text-h6">@{username}</p>
                            </div>                  
                        </main>
                        {isOwner ? (
                            <>
                            <Button icon={<Edit2Icon/>} size="medium" colorScheme="light-green" text={"Editar Readlist"} fullwidth={true} onClick={() => setIsEditModalOpen(true)}/>
                            <Button icon={<OpenBookIcon/>} text={"Adicionar livro"} fullwidth={true} onClick={() => setIsAddBookOpen(true)}/>
                            <Button icon={<TrashIcon/>} text={"Apagar readlist"} fullwidth={true} variant="rejeitar" onClick={() => setShowConfirmDeletePopUp(true)}/>
                            </>
                        ) : (
                            <Button icon={<HeartIcon fill={isFavorited ? "currentColor" : "none"} />} size="medium" colorScheme="light-green" text={"Favoritar"} fullwidth={true} onClick={handleFavoritar} />
                        )}
                    </div>
            
                    <div className="w-full flex flex-col gap-2">
                        {readlistInfo.descricao && (
                            <>
                                <p className="text-b2 pl-4 pr-2">{readlistInfo.descricao}</p>
                                <div className="w-full border-b" style={{ borderColor: '#E0E0E0' }}></div>
                            </>
                        )}
                        {loadingBooks ? (
                            <LoadingComponent size="small" className="p-8" />
                        ) :
                        readlistInfo.livros.length === 0 ? (
                            <p className="text-b1 body-quotation light-neutral text-center pt-4">
                                Nenhum livro ainda nesta readlist.
                            </p>
                        ) : (
                            <div className="w-full grid grid-cols-8 pr-2 pl-2 pb-2">
                                {readlistInfo.livros.map((livro) => (
                                    <LivrosReadlist
                                        key={livro._id}
                                        livro={livro}
                                        isCurrentUserOwner={isOwner}
                                        handleRemoveBook={handleRemoveBook}
                                    />  
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <PopUp
                title="Apagar Readlist?"
                description="Esta ação não pode ser desfeita."
                isOpen={showConfirmDeletePopUp}
                button1={{text: "Cancelar", icon: <RemoveIcon />, colorScheme: "light-green", onClick: () => setShowConfirmDeletePopUp(false)}}
                button2={{text: "Apagar", icon: <TrashIcon />, colorScheme: "light-brown", onClick: handleDeleteReadlist}}
                onClose={() => setShowConfirmDeletePopUp(false)}
            />
            <ToastNotification/>
        </div>
    )
}