"use client";
import { Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import { ChatProvider } from '@/contexts/chat-context';
import WidgetChat from '@/components/widget-chat';
import Input from "@/components/general-input";
import TagsDropdown from '@/components/tags-dropdown';
import { communityService } from '@/services/comunidade';
import { slugToTitle, titleToSlug } from '@/lib/slugify';
import { Comunidade, UpdateCommunityData } from '@/types/comunidade';
import Button from "@/components/button";
import LoadingPage from "@/components/loading";
import SaveIcon from "@/components/icons/SaveIcon";
import TrashIcon from "@/components/icons/TrashIcon";
import CommunityIcon from "@/components/icons/CommunityIcon";
import ImageIcon from "@/components/icons/ImageIcon";
import PopUp from "@/components/pop-up";
import RemoveIcon from "@/components/icons/RemoveIcon";
import Image from "next/image";
import { CommunityTags } from "@/types/comunidade";

function EditCommunityPage() {
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' | null }>({ text: '', type: null });
  const [isLoading, setIsLoading] = useState(false);
  const [isModerator, setIsModerator] = useState<boolean | null>(null);
  const router = useRouter();
  const params = useParams();
  const { community } = params as { community: string };

  let comunidadeNome = slugToTitle(community);
  if (!comunidadeNome && typeof window !== 'undefined') {
    try {
      const path = window.location.pathname || '';
      const m = path.match(/\/comunidade\/([^\/]+)/);
      if (m && m[1]) {
        comunidadeNome = decodeURIComponent(m[1]);
      }
    } catch {
    }
  }
  const [originalData, setOriginalData] = useState<Comunidade | null>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ nome?: string; descricao?: string; tags?: string; foto?: string }>({});
  const [showConfirmDeletePopUp, setShowConfirmDeletePopUp] = useState(false);

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => setNome(e.target.value);
  const handleDescricaoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setDescricao(e.target.value);
  
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const url = URL.createObjectURL(file)
      setFoto(file);
      setFotoPreview(url);
      setPreviewObjectUrl(url);
    }
  };
  useEffect(() => {
    return () => {
      if (previewObjectUrl && typeof URL.revokeObjectURL === 'function') {
        try {
          URL.revokeObjectURL(previewObjectUrl)
        } catch (e) {
        }
      }
    }
  }, [previewObjectUrl])

  // Carrega dados da comunidade e checa permissão
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const data = await communityService.getComunidadeByName(comunidadeNome);
        setNome(data.nome || '');
        setDescricao(data.descricao || '');
        setTags(data.tags || []);
        setFotoPreview(data.imagem_url || null);
        setOriginalData(data || null);
        try {
          const { isModerator } = await communityService.checkMemberOrMod(data.nome).catch(() => ({ isMember: false, isModerator: false }));
          setIsModerator(isModerator);
        } catch {
          setIsModerator(false);
        }
      } catch (err) {
        setMessage({ text: 'Erro ao carregar comunidade', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
    if (comunidadeNome) fetchData();
  }, [comunidadeNome]);

  // Validação dos campos
  const validate = () => {
    const newErrors: typeof errors = {};
    if (!nome.trim()) newErrors.nome = 'O nome é obrigatório.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const payload: UpdateCommunityData = {};
      if (originalData) {
        if (nome !== originalData.nome) {
          payload.nome = nome;
          payload.slug = titleToSlug(nome);
        }
        if (descricao !== originalData.descricao && descricao.trim() !== '') payload.descricao = descricao;
        if (JSON.stringify(tags || []) !== JSON.stringify(originalData.tags || [])) payload.tags = tags.map(tag => tag.toLowerCase());
      } else {
        payload.nome = nome;
        payload.slug = titleToSlug(nome);
        if (descricao && descricao.trim() !== '') payload.descricao = descricao;
        payload.tags = tags.map(tag => tag.toLowerCase());
      }

      //if (foto) {
      //  const imagem_url = await communityService.uploadImage(foto);
      //  if (imagem_url) payload.imagem_url = imagem_url;
      //}

      if (Object.keys(payload).length === 0) {
        setMessage({ text: 'Nenhuma alteração foi feita.', type: 'error' });
        setIsLoading(false);
        return;
      }
      // Usar nome original para identificar comunidade na API
      const identifier = originalData?.nome || comunidadeNome;
      await communityService.updateCommunity(identifier, payload);
      setMessage({ text: 'A comunidade foi editada com sucesso!', type: 'success' });
      setIsLoading(false);
    } catch (err) {
      setMessage({ text: 'Erro ao editar comunidade.', type: 'error' });
      setIsLoading(false);
    }
  };

  const handleDeleteCommunity = async () => {
    setIsLoading(true);

    try {
      const identifier = originalData?.nome || comunidadeNome;
      await communityService.deleteCommunity(identifier);
      setShowConfirmDeletePopUp(false);
      router.push('/comunidades');

    } catch (err) {
      setMessage({ text: 'Erro ao apagar comunidade.', type: 'error' });

    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <LoadingPage />
      </div>
    );
  }

  return (
    <ChatProvider>
      <div className="flex w-full h-screen bg-white">
        <Sidebar />

        {/*Conteúdo Principal*/}
        {isModerator === false ? (
          <PopUp
            title="Uh-oh!"
            description="Você não tem permissão para editar essa comunidade."
            leftIcon={<RemoveIcon size={24} fill="#8D3019" />}
            button1={{ text: nome, icon: <CommunityIcon />, colorScheme: 'light-brown', onClick: () => {router.push(`/comunidade/${originalData?.slug || titleToSlug(comunidadeNome)}`)}}}
            isOpen={true}
          />
        ) : message.text ? (
          <PopUp
            title={message.type === 'error' ? 'Erro!' : 'Sucesso!'}
            description={message.text}
            button1={{ text: nome, icon: <CommunityIcon />, colorScheme: message.type === 'error' ? 'light-brown' : 'light-green', onClick: () => {
              setMessage({ text: '', type: null });
              router.push(`/comunidade/${originalData?.slug || titleToSlug(comunidadeNome)}`);
            } }}
            isOpen={true}
          />
        ) : (
          <div className="w-full flex flex-col light-neutral p-10">
            <div 
              className="flex flex-row items-center pb-2 mb-4 gap-2"
              style={{ borderBottomWidth: 'var(--small-border-width)', borderBottomColor: 'var(--color-gray-200)' }}
            >
              <CommunityIcon size={32} />
              <h1 className="text-h4">Editar Comunidade</h1>
            </div>
            {/* Formulário de edição de comunidade */}
            <form id="form-editar-comunidade" className="w-full flex flex-row p-4" onSubmit={handleSubmit}>
              {/* Informações básicas */}
              <div className="w-3/5 flex flex-col justify-between">
                <div className="flex flex-col gap-1 mb-4">
                  <label className="text-h6" htmlFor="nome-comunidade">Nome</label>
                  <Input
                    id="nome-comunidade"
                    placeholder="Digite o nome da comunidade"
                    className="w-full"
                    value={nome}
                    onChange={handleNomeChange}
                    helperText={originalData ? `Nome Atual: ${originalData.nome}` : ''}
                  />
                  {errors.nome && <span className="text-red-500 text-b3">{errors.nome}</span>}
                </div>
                <div className="flex flex-col gap-1 mb-4">
                  <label className="text-h6" htmlFor="descricao-comunidade">Descrição</label>
                  <textarea
                    id="descricao-comunidade"
                    placeholder="Digite a descrição da comunidade"
                    className={`h-48 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-gray-400 text-gray-900 border border-gray-300 bg-white focus:ring-green-900 focus:border-green-900 hover:border-gray-400 medium-box text-b2 w-full light-neutral resize-none`}
                    value={descricao}
                    onChange={handleDescricaoChange}
                  />
                  {errors.descricao && <span className="text-red-500 text-xs">{errors.descricao}</span>}
                </div>
                <div className="flex flex-col gap-1 mb-4">
                  <label className="text-h6" id="tags-comunidade-label">Tags</label>
                  <TagsDropdown id="tags-comunidade" tags={CommunityTags} selectedTags={tags} setSelectedTags={setTags} placeholder="Selecione gêneros da comunidade" />
                  {errors.tags && <span className="text-red-500 text-xs">{errors.tags}</span>}
                </div>
              </div>
              {/* Upload de Imagem de Capa */}
              <div className="w-2/5 flex flex-col items-center justify-center">
                <div className="relative w-40 h-40 bg-gray-200 rounded-full mb-4 flex items-center justify-center text-gray-400 text-b3 overflow-hidden">
                  {fotoPreview ? (
                    <Image
                      src={fotoPreview}
                      alt="Prévia"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    'Prévia'
                  )}
                </div>
                <label htmlFor="upload-capa" className="text-h6 mb-1">Imagem de Capa</label>
                <input
                  id="upload-capa"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFotoChange}
                  style={{ display: "none" }}
                />
                <Button
                  type="button"
                  text="Fazer Upload"
                  icon={<ImageIcon />}
                  size="small"
                  colorScheme="light-green"
                  onClick={() => {
                    const input = document.getElementById('upload-capa');
                    if (input) input.click();
                  }}
                />
              </div>
            </form>
            <div 
              className="w-full flex flex-row items-center justify-between pt-4 mt-2"
              style={{ borderTopWidth: 'var(--small-border-width)', borderTopColor: 'var(--color-gray-200)' }}
            >
              <Button
                text="Apagar Comunidade"
                icon={<TrashIcon />}
                size="medium"
                colorScheme="light-brown"
                onClick={() => setShowConfirmDeletePopUp(true)}
                disabled={isLoading}
              />
              <div className="flex flex-row gap-1 justify-end">
                <Button
                  text="Cancelar"
                  icon={<TrashIcon />}
                  size="medium"
                  colorScheme="light-brown"
                  disabled={isLoading}
                  path={`/comunidade/${originalData?.slug || titleToSlug(comunidadeNome)}`}
                />
                <Button
                  type="submit"
                  form="form-editar-comunidade"
                  text={isLoading ? 'Salvando...' : 'Salvar Alterações'}
                  icon={<SaveIcon />}
                  size="medium"
                  colorScheme="light-green"
                  disabled={isLoading}
                />
              </div>
            </div>
            <PopUp
              title="Apagar Comunidade?"
              description="Esta ação não pode ser desfeita."
              isOpen={showConfirmDeletePopUp}
              button1={{text: "Cancelar", icon: <RemoveIcon />, colorScheme: "light-green", onClick: () => setShowConfirmDeletePopUp(false)}}
              button2={{text: "Apagar", icon: <TrashIcon />, colorScheme: "light-brown", onClick: handleDeleteCommunity}}
              onClose={() => setShowConfirmDeletePopUp(false)}
            />
            {isLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
                <LoadingPage />
              </div>
            )}
          </div>
        )}

        <WidgetChat />
      </div>
    </ChatProvider>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div> <LoadingPage /></div>}>
      <EditCommunityPage />
    </Suspense>
  );
}