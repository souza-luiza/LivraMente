"use client";

import { useEffect, useState } from "react";
import { useParams } from 'next/navigation';
import { ReadlistCard } from "../../../components/readlist-card";
import { CreateReadlist } from "../../../components/create-readlist";
import Link from "next/link";
import { useReadlistsList } from "../../../hooks/useReadlistsList";
import { useCreateReadlist } from "../../../hooks/useCreateReadlist";
import Button from "../../../components/button";
import LoadingPage from "../../../components/loading";
import Sidebar from "@/components/sidebar";
import PlusCheckboxIcon from "@/components/icons/PlusCheckboxIcon";
import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";

export default function UserReadlistsPage() {
  const params = useParams();
  const routeUsername = (params as any)?.username || '';

  // userId logado
  const loggedUserId = typeof window !== "undefined" ? localStorage.getItem("userId") || "1" : "1";
  const loggedUsername = typeof window !== "undefined" ? localStorage.getItem('username') || '' : '';
  const [profilePath, setProfilePath] = useState<string>('/');

  // Define profilePath para o link de voltar
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (routeUsername && routeUsername !== loggedUsername) {
      setProfilePath(`/${routeUsername}`);
      return;
    }
    if (loggedUsername && loggedUsername.trim()) setProfilePath(`/${loggedUsername}`);
    else setProfilePath('/');
  }, [routeUsername, loggedUsername]);

  const isMyPage = !routeUsername || routeUsername === loggedUsername;
  type TabType = 'minhas' | 'favoritas';
  const [activeTab, setActiveTab] = useState<TabType>('minhas');
  const [modalOpen, setModalOpen] = useState(false);
  const { handleCreateReadlist } = useCreateReadlist(loggedUserId);

  const identifierForHook = isMyPage ? loggedUserId : routeUsername;

  if (!isMyPage && !routeUsername) {
    return (
      <div className="flex min-h-screen h-screen m-0 bg-white">
        <Sidebar />
        <div className="flex-1 p-8 m-0">
          <div className="relative min-h-[200px] w-full flex items-center justify-center">
            <LoadingPage />
          </div>
        </div>
      </div>
    );
  }

  const { readlists, loading, error, refetch } = useReadlistsList(identifierForHook, isMyPage ? (activeTab === 'minhas' ? 'criadas' : 'favoritadas') : 'criadas');

  // Se não for minha página, mostrar só públicas
  const filteredReadlists = isMyPage
    ? readlists
    : readlists.filter(r => r.publica);

  return (
  <div className="flex min-h-screen h-screen m-0 bg-white">
      <Sidebar />
      <div className="flex-1 p-8 m-0">
        <div className="flex items-center gap-3 mb-4 border-none p-0">
          <span className="flex items-center h-10">
            <Link
              href={profilePath}
              className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-[var(--secondary-100)] text-[var(--secondary-700)]"
              aria-label="Voltar"
            >
              <ArrowLeftIcon className="w-10 h-10" />
            </Link>
          </span>
          <h1 className="font-extrabold tracking-tight font-poppins text-h2 text-[var(--secondary-700)]">
            {isMyPage ? "Minhas readlists" : `Readlists de ${routeUsername}`}
          </h1>
        </div>
        {/* Filtros e botão de criar readlist só se for minha página */}
        {isMyPage && (
          <div className="flex items-center gap-6 mb-4">
            <Button
              type="button"
              text={"Criar readlist"}
              icon={<PlusCheckboxIcon />}
              size="medium"
              colorScheme="light-green"
              onClick={() => setModalOpen(true)}
            />
            {/* Tabs: minhas e favoritadas */}
            <div className="flex gap-2">
              <button
                className={`px-5 py-2 rounded-full font-bold text-b2 font-poppins transition-all shadow ${activeTab === 'minhas' ? 'bg-[var(--secondary-300)] text-[var(--secondary-800)] scale-105' : 'bg-[var(--secondary-100)] text-[var(--secondary-700)]'}`}
                onClick={() => setActiveTab('minhas')}
                style={{ fontFamily: 'var(--font-poppins)', fontWeight: 600 }}
              >
                Criadas por mim
              </button>
              <button
                className={`px-5 py-2 rounded-full font-bold text-b2 font-poppins transition-all shadow ${activeTab !== 'minhas' ? 'bg-[var(--secondary-300)] text-[var(--secondary-800)] scale-105' : 'bg-[var(--secondary-100)] text-[var(--secondary-700)]'}`}
                onClick={() => setActiveTab('favoritas')}
                style={{ fontFamily: 'var(--font-poppins)', fontWeight: 600 }}
                data-testid="favoritas-tab"
              >
                Favoritadas
              </button>
            </div>
          </div>
        )}
        {/* Carregar botão de criação de readlist */}
        {isMyPage && activeTab === 'minhas' && (
          <CreateReadlist
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onCreate={async (data, setError) => {
              await handleCreateReadlist(data, setError, () => refetch && refetch());
            }}
          />
        )}
        {/* Loading */}
        <div className="relative min-h-[200px] w-full">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
              <LoadingPage />
            </div>
          )}
        {/* Erro */}
        {!loading && filteredReadlists.length === 0 && (
          <div className="flex flex-col items-start justify-start mt-2 w-full">
            {error ? (
              <div className="text-b2 text-red-600 text-center mt-2" data-testid="error-msg">{error}</div>
            ) : (
              <div className="text-b2 text-[var(--secondary-700)] mb-3 text-base font-poppins">Nenhuma readlist encontrada.</div>
            )}
          </div>
        )}
        {/* Cards de readlists */}
        {!loading && filteredReadlists.length > 0 && (
          <div className="flex flex-col gap-1 mt-8">
            {filteredReadlists.map((r) => (
              <ReadlistCard key={r._id} r={{...r, favorito: activeTab === 'favoritas' ? true : r.favorito, nome: activeTab === 'favoritas' ? 'Favoritada' : r.nome }} userId={loggedUserId} />
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}