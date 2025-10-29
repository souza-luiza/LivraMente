"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/user-store";
import Sidebar from "@/components/sidebar";
import SearchBar from "@/components/searchbar";
import Button from "@/components/button";
import Image from "next/image";
import Input from "@/components/general-input";
import { toast } from "react-toastify";
import  TrashIcon from "@/components/icons/TrashIcon";
import SaveIcon from "@/components/icons/SaveIcon";
import EditIcon from "@/components/icons/EditIcon";

// Renomeado para refletir a função da página
export default function SettingsProfilePage() {
  const router = useRouter();
  const { username, pronouns, profileImageUrl, setUsername, setPronouns, setProfileImageUrl } = useUserStore();

  // Estado para a SearchBar que estava faltando
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    pronouns: "",
    profileImageUrl: "",
  });

  const [errors, setErrors] = useState({ name: "", pronouns: "", profileImageUrl: "" });

  useEffect(() => {
    setFormData({
      name: username,
      pronouns: pronouns,
      profileImageUrl: profileImageUrl,
    });
  }, [username, pronouns, profileImageUrl]);

  useEffect(() => {
    if(!username) {
      router.push("/login");
    }
  }, [username, profileImageUrl, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    if (!formData.name.trim()) {
      setErrors((prev) => ({ ...prev, name: "Nome é obrigatório" }));
      isValid = false;
    }
    return isValid;
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Simulando uma chamada de API que sempre funciona
      //console.log("Salvando dados:", formData);

      setUsername(formData.name);
      setPronouns(formData.pronouns); 
      setProfileImageUrl(formData.profileImageUrl);
      toast.success("Perfil atualizado com sucesso!");
      // router.push("/profile");
    } catch (error) {
      toast.error("Erro de conexão.");
    }
  };

  if (!username) {
    return null; // Ou um indicador de carregamento
  }

  return (
    <div className="flex items-center h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-grow flex flex-col overflow-hidden">

        <div className="flex-grow overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto bg-white large-border-radius p-8 shadow-sm">
            <h1 className="text-h4 font-bold text-[#23160A] mb-6">
              Editar Perfil
            </h1>

            <form onSubmit={handleSaveChanges} className="space-y-6">
              <div className="flex items-center gap-4">
                <Image
                  className="w-24 h-24 rounded-full object-cover"
                  src={profileImageUrl || "/default-profile.png"}
                  width={100}
                  height={100}
                  alt="Foto do Perfil"
                  // Adiciona um fallback para caso a imagem quebre - obs.: é um teste
                  onError={(e) => { e.currentTarget.src = profileImageUrl; }}
                />
                <Button icon={<EditIcon />} colorScheme="dark-green" size="medium" text='Alterar Foto' onClick={() => toast.info("Função ainda não implementada!")}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Input
                  name="name"
                  label="Nome de Usuário"
                  helperText={`Nome de usuário atual: ${username}`}
                  value={formData.name}
                  onChange={handleInputChange}
                  error={errors.name}
                  fullWidth
                  placeholder="Novo nome de usuário"
                />
              </div>

              <Input
                name="pronouns"
                label="Pronomes"
                helperText={`Pronomes atuais: ${pronouns}`}
                value={formData.pronouns}
                onChange={handleInputChange}
                error={errors.pronouns}
                fullWidth
                placeholder="Ela/Dela, Ele/Dele, Etc..."
              />

              <div className="flex justify-end gap-4 pt-4 border-t border-neutral-200">
                 <Button icon={<TrashIcon />} colorScheme="light-brown" size="medium" text='Cancelar' onClick={() => router.back()}
                />
                <Button icon={<SaveIcon />} colorScheme="dark-green" size="medium" text='Salvar Alterações' onClick={handleSaveChanges}
                />
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

