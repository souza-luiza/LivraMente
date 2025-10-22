'use client';

import { useState } from "react";
import { TabProvider, TabList, Tab, TabPanel } from "@/components/tabs";
import SingleUserIcon from "@/components/icons/SingleUserIcon";
import NotificationsIcon from "@/components/icons/NotificationsIcon";
import BlockIcon from "@/components/icons/BlockIcon";
import ShieldIcon from "@/components/icons/ShieldIcon";
import ProfileIcon from "@/components/profile-icon";
import Button from "@/components/button";
import Input from "@/components/general-input";
import ChevronRightIcon from "@/components/icons/ChevronRightIcon";
import EditIcon from "@/components/icons/EditIcon";
import LogoutIcon from "@/components/icons/LogoutIcon";
import DeleteIcon from "@/components/icons/DeleteIcon";
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

export default function SettingsTabs() {
    const [value, setValue] = useState('profile');
    const [username, setUsername] = useState('user');
    const [pronome, setPronome] = useState('');
    const [email, setEmail] = useState('user@example.com');
    const [phone, setPhone] = useState('');
    const [country, setCountry] = useState('BR');

    const handleChange = (newValue: string) => {
        setValue(newValue);
    };

    return (
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
                            <ProfileIcon size={100} showProgress={false} className="text-[#4a5d3c]" />
                            <div>
                                <h5 className="text-h5 mb-2">@{username}</h5>
                                <button className="text-b2 text-[#4a5d3c] hover:underline font-medium flex items-center gap-2">
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
                                        label="Nome de usuário"
                                        placeholder="Seu nome de usuário"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        fullWidth
                                    />
                                    <Input
                                        label="Pronome"
                                        placeholder="ele/dele, ela/dela, etc."
                                        value={pronome}
                                        onChange={(e) => setPronome(e.target.value)}
                                        fullWidth
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <Input
                                        label="Email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        fullWidth
                                    />
                                    <Input
                                        label="Telefone"
                                        placeholder="(00) 00000-0000"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        fullWidth
                                    />
                                    <CountrySelect
                                        label="País"
                                        value={country}
                                        onChange={(value) => setCountry(value)}
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
                                />
                                <Button 
                                    text="Cancelar" 
                                    icon={<RemoveIcon />} 
                                    size="medium" 
                                    colorScheme="light-neutral"
                                />
                            </div>
                        </div>

                        {/* Privacidade */}
                        <div className="mb-10">
                            <h4 className="text-h4 mb-6">Privacidade da Conta</h4>
                            <button className="w-1/2 flex justify-between items-center p-5 hover:bg-[#f9fafb] rounded-lg transition-all border border-[#e5e7eb] group">
                                <div className="flex items-center gap-4">
                                    <GlobeIcon size={24} className="text-[#4a5d3c]" />
                                    <div className="text-left">
                                        <p className="text-b1 font-semibold">Conta Pública</p>
                                        <p className="text-b2 text-gray-500">Qualquer pessoa pode ver suas publicações</p>
                                    </div>
                                </div>
                                <ChevronRightIcon size={20} className="text-gray-400 group-hover:text-[#4a5d3c] transition-colors" />
                            </button>
                        </div>

                        {/* Configurações Críticas */}
                        <div>
                            <h4 className="text-h4 mb-6 text-red-600">Configurações Críticas</h4>
                            <div className="space-y-3">
                                <button className="w-1/2 flex justify-between items-center p-5 hover:bg-red-50 rounded-lg transition-all border border-red-200 group">
                                    <div className="flex items-center gap-4 text-red-600">
                                        <PauseIcon size={24} />
                                        <div className="text-left">
                                            <p className="text-b1 font-semibold">Desativar conta temporariamente</p>
                                            <p className="text-b2 text-red-500">Suas informações serão preservadas</p>
                                        </div>
                                    </div>
                                    <ChevronRightIcon size={20} className="text-red-400 group-hover:text-red-600 transition-colors" />
                                </button>
                                <button className="w-1/2 flex items-center justify-between p-5 hover:bg-red-50 rounded-lg transition-all border border-red-200 group">
                                    <div className="flex items-center gap-4 text-red-600">
                                        <TrashIcon size={24} />
                                        <div className="text-left">
                                            <p className="text-b1 font-semibold">Excluir conta permanentemente</p>
                                            <p className="text-b2 text-red-500">Esta ação não pode ser desfeita</p>
                                        </div>
                                    </div>
                                    <ChevronRightIcon size={20} className="text-red-400 group-hover:text-red-600 transition-colors" />
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
                                { icon: <HeartIcon />, title: "Curtidas", desc: "Quando alguém curtir sua publicação" },
                                { icon: <CommentIcon />, title: "Comentários", desc: "Quando alguém comentar suas publicações" },
                                { icon: <MentionIcon />, title: "Menções", desc: "Quando alguém mencionar você" },
                                { icon: <SingleUserIcon />, title: "Novos seguidores", desc: "Quando alguém começar a seguir você" }
                            ].map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-5 border border-[#e5e7eb] rounded-lg hover:border-[#4a5d3c] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="text-[#4a5d3c]">{item.icon}</div>
                                        <div>
                                            <p className="text-b1 font-semibold">{item.title}</p>
                                            <p className="text-b2 text-gray-500">{item.desc}</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
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
                                { icon: <ShieldIcon />, title: "Alterar senha", desc: "Última alteração há 3 meses" },
                                { icon: <KeyIcon />, title: "Autenticação de dois fatores", desc: "Adicione uma camada extra de segurança" },
                                { icon: <NotificationsIcon />, title: "Sessões ativas", desc: "1 dispositivo conectado" }
                            ].map((item, index) => (
                                <button key={index} className="w-full flex items-center justify-between p-5 hover:bg-[#f9fafb] rounded-lg transition-all border border-[#e5e7eb] group">
                                    <div className="flex items-center gap-4">
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
                            <p className="text-b1 text-gray-600">
                                Usuários bloqueados não poderão encontrar seu perfil, publicações ou lista de leitura. 
                            </p>
                            <p className="text-b2">
                                Eles não serão notificados que você os bloqueou.
                            </p>
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
    );
}