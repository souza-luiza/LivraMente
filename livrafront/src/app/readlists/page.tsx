"use client";

import { useEffect, useState } from "react";
import { ReadlistCard } from "../../components/readlist-card";
import { CreateReadlist } from "../../components/create-readlist";
import Link from "next/link";
import { useReadlistsList } from "../../hooks/useReadlistsList";
import { useCreateReadlist } from "../../hooks/useCreateReadlist";
import Button from "../../components/button";
import LoadingPage from "../../components/loading";
import Sidebar from "@/components/sidebar";
import PlusCheckboxIcon from "@/components/icons/PlusCheckboxIcon";
import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";

export default function UserReadlistsPage() {
  const gingerImg = '/ginger.jpg';
  // userId logado
  const loggedUserId = typeof window !== "undefined" ? localStorage.getItem("userId") || "1" : "1";
  // userId da página (pode vir da query string)
  const [pageUserId, setPageUserId] = useState<string>(loggedUserId);
  const [pageUsername, setPageUsername] = useState<string>("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qUserId = params.get("userId");
      if (qUserId && qUserId !== pageUserId) {
        setPageUserId(qUserId);
      }
    }
  }, []);

  // Busca username do usuário da página se não for o próprio
  useEffect(() => {
    if (pageUserId !== loggedUserId) {
      fetch(`/api/users/${pageUserId}`)
        .then(res => res.json())
        .then(data => setPageUsername(data.username || "Usuário"))
        .catch(() => setPageUsername("Usuário"));
    }
  }, [pageUserId, loggedUserId]);

  const { readlists, loading, error } = useReadlistsList(pageUserId);
  const [modalOpen, setModalOpen] = useState(false);
  const { handleCreateReadlist } = useCreateReadlist(loggedUserId);

  const isMyPage = loggedUserId === pageUserId;
  type TabType = 'minhas' | 'favoritas';
  const [activeTab, setActiveTab] = useState<TabType>('minhas');
  const [favoritedReadlists, setFavoritedReadlists] = useState<typeof readlists>([]);

  useEffect(() => {
    if (isMyPage && activeTab === 'favoritas') {
      fetch(`/api/readlists/favorited/${loggedUserId}`)
        .then(res => res.json())
        .then(data => setFavoritedReadlists(data))
        .catch(() => setFavoritedReadlists([]));
    }
  }, [isMyPage, activeTab, loggedUserId]);

  const filteredReadlists = isMyPage
    ? activeTab === 'minhas'
      ? readlists // todas criadas por mim (privadas e públicas)
      : favoritedReadlists // públicas de outros usuários que o usuário favoritou
    : readlists.filter(r => r.publica); // só públicas de outro usuário

  return (
    <div className="flex min-h-screen m-0 bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 p-8 m-0">
        <div className="flex items-center gap-3 mb-4 border-none p-0">
          <span className="flex items-center h-10">
            <Link
              href="/perfil"
              className="flex items-center justify-center w-12 h-12 rounded-full hover:bg-[var(--secondary-100)] text-[var(--secondary-700)]"
              aria-label="Voltar"
            >
              <ArrowLeftIcon className="w-10 h-10" />
            </Link>
          </span>
          <h1 className="font-extrabold tracking-tight font-poppins text-h2 text-[var(--secondary-700)]">
            {isMyPage ? "Minhas readlists" : `Readlists de ${pageUsername}`}
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
                onClick={() => setActiveTab('minhas' as TabType)}
                style={{ fontFamily: 'var(--font-poppins)', fontWeight: 600 }}
              >
                Criadas por mim
              </button>
              <button
                className={`px-5 py-2 rounded-full font-bold text-b2 font-poppins transition-all shadow ${activeTab !== 'minhas' ? 'bg-[var(--secondary-300)] text-[var(--secondary-800)] scale-105' : 'bg-[var(--secondary-100)] text-[var(--secondary-700)]'}`}
                onClick={() => setActiveTab('favoritas' as TabType)}
                style={{ fontFamily: 'var(--font-poppins)', fontWeight: 600 }}
                data-testid="favoritas-tab"
              >
                Favoritadas
              </button>
            </div>
          </div>
        )}
        {/* Carregar botão de criação de readlist */}
        {loading && <LoadingPage />}
        {isMyPage && activeTab === 'minhas' && (
          <CreateReadlist
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onCreate={handleCreateReadlist}
          />
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
        {filteredReadlists.length > 0 && (
          <div className="flex flex-col gap-1 w-full mt-8">
            {filteredReadlists.map((r) => (
              <ReadlistCard key={r._id} r={{...r, favorito: activeTab === 'favoritas' ? true : r.favorito, nome: activeTab === 'favoritas' ? 'Favoritada' : r.nome }} userId={loggedUserId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}