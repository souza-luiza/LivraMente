"use client";
import React, { useState, useEffect, useRef } from "react";
import WidgetChat from '@/components/widget-chat';
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Button from "@/components/button";
import Image from "next/image";
import Input from "@/components/general-input";
import { toast } from "react-toastify";
import ToastNotification from '@/components/toast-notification';
import TrashIcon from "@/components/icons/TrashIcon";
import SaveIcon from "@/components/icons/SaveIcon";
import EditIcon from "@/components/icons/EditIcon";
import ImageCropModal from "@/components/ImageCropModal";
import { updateAvatar, updateProfile } from "@/services/userService";
import { User } from "@/types/auth";
import { getSessionInfos } from "@/services/auth";

export default function EditProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { username } = params as { username: string };

  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<User>();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    pronouns: "",
    profileImageUrl: "",
  });

  const [errors, setErrors] = useState({ name: "", pronouns: "", profileImageUrl: "" });
  const [tempImageUrl, setTempImageUrl] = useState<string>("");
  const [croppedImageBlob, setCroppedImageBlob] = useState<Blob | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);

  useEffect(() => {
    if(!username) {
      router.replace('/not-found');
      return;
    }

    const fetchData = async () => {
      try {
        const info = await getSessionInfos();
        if(!info) {
          router.replace('/not-found');
          return;
        }
        if(info.username !== username) { // se tenta acessar editar perfil de outra pessoa
          router.replace('/not-found');
          return;
        }
        setUserInfo(info);
        setFormData({
          name: info.username || '',
          pronouns: info.pronouns || '',
          profileImageUrl: info.avatarUrl || '',
        });

      } catch (error) {
          toast.error("Erro ao carregar dados do usuário.");
          router.replace('/entrar');
          return;
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [username, router]);

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

    const reader = new FileReader();
    reader.onload = () => {
      setTempImageUrl(reader.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropSave = (croppedBlob: Blob) => {
    setCroppedImageBlob(croppedBlob);
    const previewUrl = URL.createObjectURL(croppedBlob);
    setFormData(prev => ({ ...prev, profileImageUrl: previewUrl }));
    setShowCropModal(false);
    toast.info('Imagem pronta. Clique em "Salvar Alterações" para confirmar.');
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setTempImageUrl("");
    // Resetar o input de arquivo para permitir selecionar a mesma imagem novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancel = () => {
    // Limpar preview e blob se houver
    if (croppedImageBlob) {
      URL.revokeObjectURL(formData.profileImageUrl);
      setCroppedImageBlob(null);
    }
    
    // Resetar formulário para valores originais
    setFormData({
      name: username,
      pronouns: userInfo?.pronouns || '',
      profileImageUrl: userInfo?.avatarUrl || '',
    });
    
    router.back();
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Atualizar avatar se houver imagem cortada
      if (croppedImageBlob) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', croppedImageBlob, 'avatar.jpg');

        await updateAvatar(formDataUpload);
      }

      // Atualizar dados do perfil
      await updateProfile({ username: formData.name, pronouns: formData.pronouns })

      toast.success("Perfil atualizado com sucesso!");
      router.push(`/${formData.name}`);
    } catch (error) {
      if(error instanceof Error && error.message === "Failed to fetch") 
        toast.error("Não foi possível conectar ao servidor.");
      else
        toast.error(error instanceof Error ? error.message : "Erro ao atualizar dados do usuário.");
    } finally {
      setIsLoading(false);
      setCroppedImageBlob(null);
    }
  };

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
                <div className="relative">
                  <Image
                    className="w-24 h-24 rounded-full object-cover"
                    src={formData.profileImageUrl || "/AbstractUser.png"}
                    width={100}
                    height={100}
                    alt="Foto do Perfil"
                    onError={(e) => { e.currentTarget.src = "/AbstractUser.png"; }}
                  />
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                
                <Button 
                  icon={<EditIcon />} 
                  colorScheme="dark-green" 
                  size="medium" 
                  text='Alterar Foto' 
                  onClick={handleImageClick}
                  type="button"
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
                helperText={`Pronomes atuais: ${userInfo?.pronouns}`}
                value={formData.pronouns}
                onChange={handleInputChange}
                error={errors.pronouns}
                fullWidth
                placeholder="Ela/Dela, Ele/Dele, Etc..."
              />

              <div className="flex justify-end gap-4 pt-4 border-t border-neutral-200">
                <Button 
                  icon={<TrashIcon />} 
                  colorScheme="light-brown" 
                  size="medium" 
                  text='Cancelar' 
                  onClick={handleCancel}
                  type="button"
                />
                <Button 
                  icon={<SaveIcon />} 
                  colorScheme="dark-green" 
                  size="medium" 
                  text='Salvar Alterações' 
                  onClick={handleSaveChanges} 
                  loading={isLoading}
                />
              </div>
            </form>
          </div>
        </div>
      </main>

        <ImageCropModal
          isOpen={showCropModal}
          imageUrl={tempImageUrl}
          onClose={handleCropCancel}
          onSave={handleCropSave}
        />
        <ToastNotification />
        <WidgetChat />
      </div>
  );
}