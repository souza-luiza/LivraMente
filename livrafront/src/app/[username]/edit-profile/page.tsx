"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
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
import { api } from "@/lib/api";

export default function SettingsProfilePage() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();
  const { username, pronouns, profileImageUrl, setUsername, setPronouns, setProfileImageUrl } = useUserStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    pronouns: "",
    profileImageUrl: "",
  });
  const [errors, setErrors] = useState({ name: "", pronouns: "", profileImageUrl: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    setFormData({
      name: username,
      pronouns: pronouns,
      profileImageUrl: profileImageUrl,
    });
  }, [username, pronouns, profileImageUrl]);

  useEffect(() => {
    if (!isAuthenticated || !username) {
      router.push("/login");
    }
  }, [isAuthenticated, username, router]);

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

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    try {
      setIsUploadingImage(true);

      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/users/avatar`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }

      const data = await response.json();
      setProfileImageUrl(data.avatarUrl);
      setFormData(prev => ({ ...prev, profileImageUrl: data.avatarUrl }));
      toast.success('Foto de perfil atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao atualizar foto de perfil');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await api.put('/users/profile', {
        username: formData.name,
        pronouns: formData.pronouns,
      });

      setUsername(formData.name);
      setPronouns(formData.pronouns);

      toast.success("Perfil atualizado com sucesso!");
      router.push(`/${formData.name}`);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !username) {
    return null;
  }

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

        <div className="flex-grow overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto bg-white rounded-lg p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Editar Perfil
            </h1>

            <form onSubmit={handleSaveChanges} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Image
                    className="w-24 h-24 rounded-full object-cover"
                    src={formData.profileImageUrl || "/AbstractUser.png"}
                    width={100}
                    height={100}
                    alt="Foto do Perfil"
                    onError={(e) => { e.currentTarget.src = "/AbstractUser.png"; }}
                  />
                  {isUploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                
                <Button 
                  icon={<EditIcon size={16}/>} 
                  colorScheme="dark-green" 
                  size="small" 
                  text='Alterar Foto' 
                  onClick={handleImageClick}
                  disabled={isUploadingImage}
                  type="button"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  Nome de Usuário
                  <span className="ml-2 text-xs text-gray-500">(Nome de usuário atual: {username})</span>
                </label>

                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={errors.name}
                  fullWidth
                  placeholder="Novo nome de usuário"
                />
              </div>

              <label className="text-sm font-medium text-gray-700 flex items-center">
                Pronomes
                <span className="ml-2 text-xs text-gray-500">(Pronomes atuais: {pronouns})</span>
              </label>

              <Input
                name="pronouns"
                value={formData.pronouns}
                onChange={handleInputChange}
                error={errors.pronouns}
                fullWidth
                placeholder="Ela/Dela, Ele/Dele, Etc..."
              />

              <div className="flex justify-end gap-4 pt-4 border-t border-neutral-200">
                <Button 
                  icon={<TrashIcon size={16}/>} 
                  colorScheme="light-brown" 
                  size="small" 
                  text='Cancelar' 
                  onClick={() => router.back()}
                  type="button"
                />
                <Button 
                  icon={<SaveIcon size={16}/>} 
                  colorScheme="dark-green" 
                  size="small" 
                  text='Salvar Alterações' 
                  onClick={handleSaveChanges} 
                  loading={isLoading}
                />
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

