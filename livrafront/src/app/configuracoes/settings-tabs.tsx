'use client';

import { useState, useEffect, useRef } from "react";
import { toast } from 'react-toastify'
import { TabProvider, TabList, Tab, TabPanel } from "@/components/tabs";
import SingleUserIcon from "@/components/icons/SingleUserIcon";
import NotificationsIcon from "@/components/icons/NotificationsIcon";
import BlockIcon from "@/components/icons/BlockIcon";
import ShieldIcon from "@/components/icons/ShieldIcon";
import Button from "@/components/button";
import Input from "@/components/general-input";
import PhoneInputComponent from "@/components/phone-input";
import ChevronRightIcon from "@/components/icons/ChevronRightIcon";
import EditIcon from "@/components/icons/EditIcon";
import GlobeIcon from "@/components/icons/GlobeIcon";
import HeartIcon from "@/components/icons/HeartIcon";
import CommentIcon from "@/components/icons/CommentIcon";
import MentionIcon from "@/components/icons/MentionIcon";
import KeyIcon from "@/components/icons/KeyIcon";
import CountrySelect from "@/components/select-country";
import SaveIcon from "@/components/icons/SaveIcon";
import RemoveIcon from "@/components/icons/RemoveIcon";
import TrashIcon from "@/components/icons/TrashIcon";
import PauseIcon from "@/components/icons/PauseIcon";
import PlusCheckboxIcon from "@/components/icons/PlusCheckboxIcon";
import Image from "next/image";
import ImageCropModal from "@/components/ImageCropModal";
import { getSessionInfos } from "@/services/auth";
import { User } from "@/types/auth";
import { updateAvatar, updateProfile } from "@/services/userService";
import { useRouter } from "next/navigation";
import LoadingPage from "@/components/loading";
import { useNotPrefStore } from "@/stores/notificacoesStore";

export default function SettingsTabs() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { preferencias, alterarPreferencia } = useNotPrefStore();
    
    const [value, setValue] = useState('profile');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [userData, setUserData] = useState<User>();
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        pronouns: '',
        phone: '',
        country: 'BR',
        avatarUrl: ''
    });
    
    // Image crop states
    const [tempImageUrl, setTempImageUrl] = useState<string>("");
    const [croppedImageBlob, setCroppedImageBlob] = useState<Blob | null>(null);
    const [showCropModal, setShowCropModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const info = await getSessionInfos();
                if(!info) {
                    router.replace('/entrar');
                    return;
                };
                setUserData(info);
                setFormData({
                    username: info.username || '',
                    email: info.email || '',
                    pronouns: info.pronouns || '',
                    phone: '',
                    country: 'BR',
                    avatarUrl: info.avatarUrl || ''
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
    }, [router]);

    const handleChange = (newValue: string) => {
        setValue(newValue);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
        setFormData(prev => ({ ...prev, avatarUrl: previewUrl }));
        setShowCropModal(false);
        toast.info('Imagem pronta. Clique em "Salvar Alterações" para confirmar.');
    };

    const handleCropCancel = () => {
        setShowCropModal(false);
        setTempImageUrl("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleCancel = () => {
        if (croppedImageBlob) {
            URL.revokeObjectURL(formData.avatarUrl);
            setCroppedImageBlob(null);
        }
        
        if (userData) {
            setFormData({
                username: userData.username,
                pronouns: userData.pronouns || '',
                email: userData.email,
                phone: '',
                country: 'BR',
                avatarUrl: userData.avatarUrl || ''
            });
        }
    };

    const handleSaveChanges = async () => {
        if (!formData.username || !formData.email) {
            toast.error('Preencha todos os campos obrigatórios');
            return;
        }
        
        setIsSaving(true);

        try {
            // Atualizar avatar se houver imagem cortada
            if (croppedImageBlob) {
                const formDataUpload = new FormData();
                formDataUpload.append('file', croppedImageBlob, 'avatar.jpg');
                await updateAvatar(formDataUpload);
            }

            await updateProfile({
                username: formData.username,
                pronouns: formData.pronouns,
                email: formData.email
            });

            toast.success("Perfil atualizado com sucesso!");
        } catch (error) {
            if(error instanceof Error && error.message === "Failed to fetch") 
                toast.error("Não foi possível conectar ao servidor.");
            else
                toast.error(error instanceof Error ? error.message : "Erro ao atualizar dados do usuário.");
        } finally {
            setIsSaving(false);
            setCroppedImageBlob(null);
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center">
                <LoadingPage />
            </div>
        );
    }

    return (
        <>
            <TabProvider value={value} onChange={handleChange}>
                <div className="bg-white rounded-lg shadow-sm mt-6">
                    <TabList>
                        <Tab label="Meu Perfil" icon={<SingleUserIcon />} value="profile" size="medium" />
                        <Tab label="Notificações" icon={<NotificationsIcon />} value="notifications" size="medium" />
                        <Tab label="Segurança" icon={<ShieldIcon />} value="security" size="medium" />
                        <Tab label="Restrições" icon={<BlockIcon />} value="restrictions" size="medium" />
                    </TabList>

                    {/* Perfil */}
                    <TabPanel value="profile">
                        <div className="w-full mx-auto p-8">
                            {/* Foto de Perfil */}
                            <div className="flex items-center gap-6 mb-10">
                                <div className="relative">
                                    <Image
                                        className="w-24 h-24 rounded-full object-cover"
                                        src={formData.avatarUrl || "/AbstractUser.png"}
                                        width={96}
                                        height={96}
                                        alt="Foto do Perfil"
                                        onError={(e) => { e.currentTarget.src = "/AbstractUser.png"; }}
                                    />
                                </div>
                                <div>
                                    <h5 className="text-h5 mb-2">@{formData.username}</h5>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                    />
                                    <button 
                                        onClick={handleImageClick}
                                        className="text-b2 text-[#4a5d3c] hover:underline font-medium flex items-center gap-2"
                                    >
                                        <EditIcon size={16} />
                                        Alterar foto de perfil
                                    </button>
                                </div>
                            </div>

                            {/* Informações Pessoais */}
                            <div className="mb-10">
                                <h4 className="text-h4 mb-6">Informações Pessoais</h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            className="flex flex-col"
                                            type="input"
                                            name="username"
                                            label="Nome de usuário"
                                            placeholder="Seu nome de usuário"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            fullWidth
                                        />
                                        <Input
                                            name="pronouns"
                                            label="Pronome"
                                            placeholder="ele/dele, ela/dela, etc."
                                            value={formData.pronouns}
                                            onChange={handleInputChange}
                                            fullWidth
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <Input
                                            name="email"
                                            label="Email"
                                            type="email"
                                            placeholder="seu@email.com"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            fullWidth
                                        />
                                        <PhoneInputComponent
                                            label="Telefone"
                                            placeholder="Digite seu telefone"
                                            value={formData.phone}
                                            onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))
                                            }
                                            fullWidth
                                        />
                                        <CountrySelect
                                            label="País"
                                            value={formData.country}
                                            onChange={(value) => setFormData(prev => ({ ...prev, country: value }))
                                            }
                                            fullWidth
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex gap-3">
                                    <Button 
                                        text="Salvar alterações" 
                                        icon={<SaveIcon />} 
                                        size="medium" 
                                        colorScheme="dark-green"
                                        onClick={handleSaveChanges}
                                        loading={isSaving}
                                    />
                                    <Button 
                                        text="Cancelar" 
                                        icon={<RemoveIcon />} 
                                        size="medium" 
                                        colorScheme="light-neutral"
                                        onClick={handleCancel}
                                    />
                                </div>
                            </div>

                            {/* Privacidade */}
                            <div className="mb-10">
                                <h4 className="text-h4 mb-6">Privacidade da Conta</h4>
                                <button className="w-1/2 flex justify-start items-center p-5 hover:bg-[#f9fafb] rounded-lg transition-all border border-[#e5e7eb] group">
                                    <div className="w-full flex items-center gap-4">
                                        <GlobeIcon size={24} className="text-[#4a5d3c]" />
                                        <div className="text-left">
                                            <p className="text-b1 font-semibold">Conta Pública</p>
                                            <p className="text-b2 text-gray-500">Qualquer pessoa pode ver suas publicações</p>
                                        </div>
                                        <ChevronRightIcon size={30} className="text-gray-400 group-hover:text-[#4a5d3c] transition-colors" />
                                    </div>
                                </button>
                            </div>

                            {/* Configurações Críticas */}
                            <div>
                                <h4 className="text-h4 mb-6 text-red-600">Configurações Críticas</h4>
                                <div className="space-y-3 justify-center">
                                    <button className="w-1/2 flex justify-start items-center p-5 hover:bg-red-50 rounded-lg transition-all border border-red-200 group">
                                        <div className="w-full flex items-center gap-4 text-red-600">
                                            <PauseIcon size={24} />
                                            <div className="text-left">
                                                <p className="text-b1 font-semibold">Desativar conta temporariamente</p>
                                                <p className="text-b2 text-red-500">Suas informações serão preservadas</p>
                                            </div>
                                            <ChevronRightIcon size={30} className="text-red-400 group-hover:text-red-600 transition-colors" />
                                        </div>
                                    </button>
                                    <button className="w-1/2 flex items-center justify-start p-5 hover:bg-red-50 rounded-lg transition-all border border-red-200 group">
                                        <div className="w-full flex items-center gap-4 text-red-600">
                                            <TrashIcon size={24} />
                                            <div className="flex justify-between items-center gap-4 text-left">
                                                <div className="flex flex-col">
                                                    <p className="text-b1 font-semibold">Excluir conta permanentemente</p>
                                                    <p className="text-b2 text-red-500">Esta ação não pode ser desfeita</p>
                                                </div>
                                                <ChevronRightIcon size={30} className="text-red-400 group-hover:text-red-600 transition-colors" />
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    {/* Notificações */}
                    <TabPanel value="notifications">
                        <div className="w-full p-8">
                            <div className="mb-8">
                                <h4 className="text-h4 mb-2">Preferências de Notificação</h4>
                                <p className="text-b1 text-gray-600">Gerencie como você deseja ser notificado sobre atividades</p>
                            </div>
                            
                            <div className="space-y-3">
                                {[
                                    { key: 'curtidas' as const, icon: <HeartIcon size={40}/>, title: "Curtidas", desc: "Quando alguém curtir sua publicação" },
                                    { key: 'comentarios' as const, icon: <CommentIcon size={40}/>, title: "Comentários", desc: "Quando alguém comentar suas publicações" },
                                    { key: 'mencoes' as const, icon: <MentionIcon size={40}/>, title: "Menções", desc: "Quando alguém mencionar você" },
                                    { key: 'novosSeguidores' as const, icon: <SingleUserIcon size={40}/>, title: "Novos seguidores", desc: "Quando alguém começar a seguir você" }
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-5 border border-[#e5e7eb] rounded-lg hover:border-[#4a5d3c] transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="text-[#4a5d3c]">{item.icon}</div>
                                            <div>
                                                <p className="text-b1 font-semibold">{item.title}</p>
                                                <p className="text-b2 text-gray-500">{item.desc}</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={preferencias[item.key]} 
                                                onChange={(e) => alterarPreferencia(item.key, e.target.checked)}
                                                className="sr-only peer" 
                                                aria-label={`Ativar notificações de ${item.title.toLowerCase()}`}
                                            />
                                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#4a5d3c] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4a5d3c]"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabPanel>

                    {/* Segurança */}
                    <TabPanel value="security">
                        <div className="w-full mx-auto p-8">
                            <div className="mb-8">
                                <h4 className="text-h4 mb-2">Segurança e Login</h4>
                                <p className="text-b1 text-gray-600">Proteja sua conta e gerencie suas sessões</p>
                            </div>
                            
                            <div className="space-y-3">
                                {[
                                    { icon: <ShieldIcon size={40} />, title: "Alterar senha", desc: "Última alteração há 3 meses" },
                                    { icon: <KeyIcon size={40} />, title: "Autenticação de dois fatores", desc: "Adicione uma camada extra de segurança" },
                                    { icon: <NotificationsIcon size={40} />, title: "Sessões ativas", desc: "1 dispositivo conectado" }
                                ].map((item, index) => (
                                    <button key={index} className="w-full flex items-center justify-start p-5 hover:bg-[#f9fafb] border border-[#e5e7eb] rounded-lg hover:border-[#4a5d3c] transition-all">
                                        <div className="w-full flex items-center gap-4">
                                            <div className="text-[#4a5d3c]">{item.icon}</div>
                                            <div className="text-left">
                                                <p className="text-b1 font-semibold">{item.title}</p>
                                                <p className="text-b2 text-gray-500">{item.desc}</p>
                                            </div>
                                        </div>
                                        <ChevronRightIcon size={20} className="text-gray-400 group-hover:text-[#4a5d3c] transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </TabPanel>

                    {/* Restrições */}
                    <TabPanel value="restrictions">
                        <div className="w-full mx-auto p-8">
                            <div className="mb-8">
                                <h4 className="text-h4 mb-2">Contas Bloqueadas</h4>
                                <p className="text-b1 text-gray-700">
                                    Usuários bloqueados não poderão encontrar seu perfil, publicações ou lista de leitura. 
                                </p>
                                <p className="text-b2 text-gray-500">
                                    Eles não serão notificados que você os bloqueou.
                                </p>                              
                            </div>
                            <div className="flex justify-end mb-2">
                                <Button 
                                    text="Bloquear Contas" 
                                    icon={<PlusCheckboxIcon />} 
                                    size="medium" 
                                    colorScheme="dark-green"
                                />
                            </div>
                            
                            <div className="border-2 border-dashed border-[#e5e7eb] rounded-lg p-16 text-center bg-[#fafbfc]">
                                <BlockIcon className="text-gray-300 mx-auto mb-4" size={64} />
                                <p className="text-h6 text-gray-700 mb-2">Nenhuma conta bloqueada</p>
                                <p className="text-b2 text-gray-500">Quando você bloquear alguém, eles aparecerão aqui</p>
                            </div>
                        </div>
                    </TabPanel>
                </div>
            </TabProvider>

            <ImageCropModal
                isOpen={showCropModal}
                imageUrl={tempImageUrl}
                onClose={handleCropCancel}
                onSave={handleCropSave}
            />
        </>
    );
}