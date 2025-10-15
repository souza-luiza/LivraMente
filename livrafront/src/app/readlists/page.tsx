"use client";

import { useEffect, useState } from "react";
import { ReadlistCard } from "../../components/readlist-card";
import { CreateReadlistModal } from "../../components/create-readlist";
import Link from "next/link";
import { useReadlistsList } from "../../hooks/useReadlistsList";
import { useCreateReadlist } from "../../hooks/useCreateReadlist";
import Button from "../../components/button";
import LoadingPage from "../../components/loading";
import Sidebar from "@/components/sidebar";

export default function UserReadlistsPage() {
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") || "1" : "1";
  const pageUserId = userId; 
  const { readlists, loading, error } = useReadlistsList(pageUserId);
  const [modalOpen, setModalOpen] = useState(false);
  const { handleCreateReadlist } = useCreateReadlist(userId);

  const isMyPage = userId === pageUserId;
  type TabType = 'minhas' | 'favoritas';
  const [activeTab, setActiveTab] = useState<TabType>('minhas');
  const [favoritedReadlists, setFavoritedReadlists] = useState<typeof readlists>([]);

  // Busca readlists favoritadas quando na aba "favoritas"
  useEffect(() => {
    if (isMyPage && activeTab === 'favoritas') {
      fetch(`/api/readlists/favorited/${userId}`)
        .then(res => res.json())
        .then(data => setFavoritedReadlists(data))
        .catch(() => setFavoritedReadlists([]));
    }
  }, [isMyPage, activeTab, userId]);

  const filteredReadlists = isMyPage
    ? activeTab === 'minhas'
      ? readlists // todas criadas por mim (privadas e públicas)
      : favoritedReadlists // públicas de outros usuários que o usuário favoritou
    : readlists.filter(r => r.publica); // só públicas de outro usuário

  const mockReadlists = [
    {
      _id: '1',
      nome: 'Favoritos',
      favorito: true,
      publica: true,
      descricao: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
      capa_url: '/kemi-teste.jpg',
      criador: { _id: userId, username: 'gatanoturna' },
      livros: ['livro1', 'livro2'],
      favoritadoPor: ['user1', 'user2', 'user3'],
      createdAt: '2025-10-01',
      updatedAt: '2025-10-02',
    },
  ];

  return (
    <div className="flex min-h-screen m-0 bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 p-8 m-0">
      <div className="flex items-center gap-3 mb-4 border-none p-0">
          <span className="flex items-center h-10">
            <Link href="/perfil" className="no-underline text-[28px] text-[#222] font-bold leading-none m-0 bg-none border-none shadow-none p-0 relative top-[2px]">
              &#60;
            </Link>
          </span>
          <h1
            className="font-extrabold tracking-tight font-poppins text-h2 text-[var(--secondary-700)]"
          >
            Minhas readlists
          </h1>
        </div>
        {/* Filtros e botão de criar readlist */}
        {isMyPage && (
          <div className="flex items-center gap-6 mb-4">
            <Button
              type="button"
              text={
                <span className="flex items-center justify-center gap-2 w-full text-center">
                  <span className="text-2xl font-bold">+</span>
                  <span className="font-extrabold text-b1">Criar readlist</span>
                </span>
              }
              icon={null}
              size="medium"
              colorScheme="light-green"
              onClick={() => setModalOpen(true)}
              style={{ minWidth: 220, minHeight: 56, fontSize: 22, borderRadius: 14, boxShadow: '0 2px 8px #0001', textAlign: 'center' }}
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
              >
                Favoritadas
              </button>
            </div>
          </div>
        )}
        {/* Modal de criação */}
        {loading && <LoadingPage />}
        {isMyPage && activeTab === 'minhas' && (
          <CreateReadlistModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onCreate={handleCreateReadlist}
          />
        )}
        {error && <div className="text-b2 text-red-600 text-center mt-8">{error}</div>}
        {!loading && !error && filteredReadlists.length === 0 && (
          <div className="flex flex-col items-start justify-start mt-2 w-full">
            <div className="text-b2 text-[var(--secondary-700)] mb-3 text-base font-poppins">Nenhuma readlist encontrada.</div>
            <div className="flex flex-col gap-6 w-full">
              {mockReadlists.map((r) => (
                <ReadlistCard key={r._id} r={r} userId={userId} />
              ))}
            </div>
          </div>
        )}
        {/* Cards de readlists */}
    <div className="flex flex-col gap-6 w-full mt-2">
          {filteredReadlists.map((r) => (
            <ReadlistCard key={r._id} r={r} userId={userId} />
          ))}
        </div>
      </div>
    </div>
  );
}