"use client";
import Link from "next/link";
import React, { useState } from "react";
import Button from "@/components/button";
import Sidebar from "@/components/sidebar";
import SearchBar from "@/components/searchbar";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/user-store";
import EditIcon from "@/components/icons/EditIcon";
import ChevronRightIcon from "@/components/icons/ChevronRightIcon";
import NotificationIcon from "@/components/icons/NotificationsIcon";

import ProfileReadlists from "@/components/profile-readlists";
import ProfilePosts from "@/components/profile-posts";
import ProfileBadge from "@/components/profile-badge";

export default function ProfilePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const { username, pronouns, profileImageUrl } = useUserStore();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-grow flex flex-col overflow-hidden">
        <div className="p-4 border-b border-neutral-200">
          <div className="max-w-2xl mx-auto">
            <SearchBar
              placeholder="Pesquisar livros, autores, amigos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Seção de Conteúdo do Perfil com rolagem */}
        <div className="flex-grow overflow-y-auto p-8">
          {/* Header do Perfil */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <img
                src={profileImageUrl || "/Readlist.svg"}
                alt={profileImageUrl ? "Foto de perfil" : "Foto de perfil de um gato"}
                className="w-32 h-32 rounded-full border-4 border-white shadow-md"
              />
            </div>
            <h1 className="text-3xl font-bold font-poppins text-gray-800 mt-4">
              {username}
            </h1>
            <p className="text-lg font-judson italic text-gray-600 mt-1 mb-4">
              {pronouns}
            </p>
            <Button
              icon={<EditIcon size={16} />} colorScheme="dark-brown" size="small" text="Editar" onClick={() => router.push("/edit-profile")} />
          </div>



          {/* Conteúdo em Duas Colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
            {/* Coluna da Esquerda: Readlists */}
            <div className="lg:col-span-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <Link href="/readlists" className="flex items-center">
                  <h2 className="text-xl font-bold text-gray-800 hover:underline">
                    Readlists
                  </h2>
                  <ChevronRightIcon size={16} className="ml-1 mt-2" />
                </Link>
              </div>
              {/* Placeholder para Readlists */}
              <div className="flex-1 bg-white/60 border-2 border-dashed border-gray-300 rounded-xl p-8 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <NotificationIcon
                    size={30}
                    className="mx-auto mb-2 text-gray-400"
                  />
                  <p className="font-semibold">Readlists em breve</p>
                  <p className="text-sm">
                    As suas coleções de livros aparecerão aqui.
                  </p>
                </div>
              </div>
            </div>

            {/* Coluna da Direita: Postagens */}
            <div className="lg:col-span-2 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <Link href="/postagens" className="flex items-center">
                  <h2 className="text-xl font-bold text-gray-800 hover:underline">
                    Postagens
                  </h2>
                  <ChevronRightIcon size={16} className="ml-1 mt-2" />
                </Link>
              </div>
              {/* Placeholder para Postagens */}
              <div className="flex-1 bg-white/60 border-2 border-dashed border-gray-300 rounded-xl p-8 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <EditIcon size={30} className="mx-auto mb-2 text-gray-400" />
                  <p className="font-semibold">Sem postagens ainda</p>
                  <p className="text-sm">
                    Quando você postar, suas publicações aparecerão aqui.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

