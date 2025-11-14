"use client";

import HeartIcon from "@/components/icons/HeartIcon";
import OpenBookIcon from "@/components/icons/OpenBookIcon";
import Readlist from "@/components/readlist";
import { FavoriteReadlist, Readlist as ReadlistType } from "@/types/readlist";
import Sidebar from "@/components/sidebar";
import { Tab, TabList, TabPanel, TabProvider } from "@/components/tabs";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSessionInfos } from "@/services/auth";
import { getFavoriteReadlists, getOwnReadlists, getPublicReadlists } from "@/services/readlists";
import { toast } from "react-toastify";
import ToastNotification from '@/components/toast-notification';
import LogoIcon from "@/components/icons/LogoIcon";
import PlusCheckboxIcon from "@/components/icons/PlusCheckboxIcon";
import Button from "@/components/button";
import { CreateReadlist } from "@/components/create-readlist";
import { useCreateReadlist } from "@/hooks/useCreateReadlist";

export default function ReadlistsPage() {
  const router = useRouter();
  const params = useParams();
  const { username } = params as { username: string };

  const [isLoading, setIsLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const [readlists, setReadlists] = useState<ReadlistType[]>([]);
  const [favReadlists, setFavReadlists] = useState<FavoriteReadlist[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { handleCreateReadlist } = useCreateReadlist();

  const [value, setValue] = useState('todas');

  const handleChange = (newValue: string) => {
    setValue(newValue);
  }

  useEffect(() => {
    if(!username || username.trim() === '')
      notFound();

    const fetchData = async () => {
      try {
        const info = await getSessionInfos();
        if(!info) {
            router.replace('/entrar');
            return;
        }
        const own = info.username === username;
        setIsOwnProfile(own);

        const userReadlists = own ? await getOwnReadlists() : await getPublicReadlists(username);
        const favoriteReadlists = own ? await getFavoriteReadlists() : [];
        setReadlists(userReadlists);
        setFavReadlists(favoriteReadlists);
      } catch (error) {
        toast.error("Erro ao carregar readlists do usuário.");
        setError(error instanceof Error ? error.message : 'Erro ao carregar readlists do usuário');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [username, router, isModalOpen]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex bg-[#E5EEDF]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-48 h-48 border-16 border-[#B0CC9E] border-t-[#5C8046] rounded-full animate-[spin_1.5s_ease-in-out_infinite]" />
            <div className="w-24 h-24 text-[#1F2A17]">
              <LogoIcon />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if(error || !readlists) {
    return (
      <div className="flex min-h-screen bg-[#E5EEDF]">
        <Sidebar />
        <main className="flex-1 flex flex-col p-8">
          <h2 className="text-h2 mb-4">Readlists</h2>
          <div className="flex items-center justify-center p-8">
            <p className="text-b1">Nenhuma readlist encontrada.</p>
          </div>
        </main>
      </div>
    )
  } 
  // fazer um return para o caso !readlist com o botão de criar readlist

  const nameTab = isOwnProfile ? "Minhas" : "Todas";
  const handleOpenCreateReadlist = () => {
    setIsModalOpen(true);
  }
  
  return (
    <div className="flex min-h-screen bg-[#E5EEDF]">
      <Sidebar />
      <main className="flex-1 flex flex-col p-8">

        {/* Cabeçalho com título e botão de criar readlist */}
        <div className="flex justify-between mb-4 items-center">
          <h2 className="text-h2 ">Readlists</h2>
          {isOwnProfile && (
            <Button
              text="Criar readlist"
              icon={<PlusCheckboxIcon />}
              colorScheme="dark-green"
              size="medium"
              onClick={handleOpenCreateReadlist}
            />
          )}
        </div>

        <CreateReadlist
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={async (data, setError) => {
            await handleCreateReadlist(data, setError);
          }}
        />

        <TabProvider value={value} onChange={handleChange}>
          <div className="bg-white rounded-lg shadow-sm mt-2">
            <TabList>
                <Tab label={nameTab} icon={<OpenBookIcon fill="currentColor"/>} value="todas" size="medium" />
                {isOwnProfile && (
                  <Tab label="Favoritas" icon={<HeartIcon fill="currentColor"/>} value="favoritas" size="medium" />
                )}
            </TabList>

            <TabPanel value="todas">
              <div className="p-3 px-6 w-full h-fit grid grid-cols-4 gap-2">
                {readlists.map((readlist) => (
                  <Readlist
                    key={readlist._id}
                    title={readlist.nome}
                    author={username}
                    link={`/${username}/readlist/${readlist.slug}`}
                  />
                ))}
              </div>
            </TabPanel>
            {isOwnProfile && (
              <TabPanel value="favoritas">
                <div className="p-3 px-6 w-full h-fit grid grid-cols-4 gap-2">
                  {favReadlists.map((readlist) => (
                    <Readlist
                      key={readlist._id}
                      title={readlist.nome}
                      author={readlist.criador.username}
                      link={`/${readlist.criador.username}/readlist/${readlist.slug}`}
                    />
                  ))}
                </div>
              </TabPanel>
            )}
          </div>
        </TabProvider>
      </main>
      <ToastNotification/>
    </div>
  )
}