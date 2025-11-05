"use client";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import Input from "@/components/general-input";
import TagsDropdown from '@/components/tags-dropdown';
import { getCommunity, updateCommunity, uploadImage, checkMemberOrMod } from '@/services/comunidade';
import { titleToSlug } from '@/lib/slugify';
import { useEditCommunity } from '@/hooks/useEditCommunity';
import { Comunidade } from '@/types/comunidade';
import Button from "@/components/button";
import CheckIcon from "@/components/icons/CheckIcon";
import ShareIcon from "@/components/icons/ShareIcon";
import LoadingPage from "@/components/loading";

function EditCommunityPage() {
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' | null }>({ text: '', type: null });
  const [isLoading, setIsLoading] = useState(false);
  const [isModerator, setIsModerator] = useState<boolean | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchNome = searchParams.get('nome') || '';
  let comunidadeNome = searchNome;
  if (!comunidadeNome && typeof window !== 'undefined') {
    try {
      const path = window.location.pathname || '';
      const m = path.match(/\/comunidade\/([^\/]+)/);
      if (m && m[1]) {
        const slug = m[1];
        const communityTitle = slug
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        comunidadeNome = communityTitle;
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
        const data = await getCommunity(comunidadeNome);
        setNome(data.nome || '');
        setDescricao(data.descricao || '');
        setTags(data.tags || []);
        setFotoPreview(data.imagem_url || null);
        setOriginalData(data || null);
        try {
          const { isModerator } = await checkMemberOrMod(data.nome).catch(() => ({ isMember: false, isModerator: false }));
          setIsModerator(Boolean(isModerator));
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

  const { handleEditCommunity, isLoading: isEditing } = useEditCommunity();

  // Envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const identifier = originalData?.nome || comunidadeNome;
      const result = await handleEditCommunity(identifier, { nome, descricao, tags, foto }, originalData || undefined);
      if (result) {
        setMessage({ text: 'Comunidade editada com sucesso!', type: 'success' });
      } else {
        setMessage({ text: 'Nenhuma alteração detectada ou erro ao editar.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Erro ao editar comunidade.', type: 'error' });
    }
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <LoadingPage />
      </div>
    );
  }
  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 p-10 flex flex-col">
        {isModerator === false ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="mb-6 text-center text-h3 font-primary --error-600" role="alert">
              Apenas moderadores podem editar esta comunidade.
            </div>
            <Button
              text="Voltar"
              icon={<ArrowLeftIcon />}
              size="large"
              colorScheme="light-green"
              onClick={() => router.push(`/comunidades/${comunidadeNome}`)}
            />
          </div>
        ) : message.text ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div
              className={`mb-6 text-center text-h3 font-primary ${
                message.type === 'error'
                  ? '--error-600'
                  : '--success-500'
              }`}
              role="alert"
            >
              {message.text}
            </div>
            <Button
              text="Voltar para comunidades"
              icon={<ArrowLeftIcon />}
              size="large"
              colorScheme={message.type === 'error' ? 'light-green' : 'dark-green'}
              onClick={() => {
                setMessage({ text: '', type: null });
                router.push(`/comunidades/${comunidadeNome}`);
              }}
            />
          </div>
        ) : (
          <>
            <div className="flex items-center mb-6">
              <Button
                text="Voltar"
                icon={<ArrowLeftIcon />}
                size="medium"
                colorScheme="light-green"
                onClick={() => router.push(`/comunidades/${comunidadeNome}`)}
              />
              <div className="w-6" />
              <h1 className="text-h3">Editar comunidade</h1>
            </div>
            {/* Formulário de edição de comunidade */}
            <form className="mt-4" onSubmit={handleSubmit}>
              <div className="mb-4 flex flex-row items-start gap-40">
                {/* Informações básicas */}
                <div className="flex-1 max-w-2xl">
                  <div className="mb-4">
                    <label className="text-b1" htmlFor="nome-comunidade">Nome da comunidade</label>
                    <Input
                      id="nome-comunidade"
                      placeholder="Digite o nome da comunidade"
                      className="w-full"
                      value={nome}
                      onChange={handleNomeChange}
                    />
                    {errors.nome && <span className="text-red-500 text-xs">{errors.nome}</span>}
                  </div>
                  <div className="mb-4">
                    <label className="text-b1" htmlFor="descricao-comunidade">Descrição da comunidade</label>
                      <textarea
                        id="descricao-comunidade"
                        placeholder="Digite a descrição da comunidade"
                        className={`h-32 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-gray-400 text-gray-900 border border-gray-300 bg-white focus:ring-green-900 focus:border-green-900 hover:border-gray-400 medium-box text-b2 w-full light-neutral resize-none`}
                        value={descricao}
                        onChange={handleDescricaoChange}
                      />
                    {errors.descricao && <span className="text-red-500 text-xs">{errors.descricao}</span>}
                  </div>
                    <div className="mb-4">
                      <label className="text-b1" id="tags-comunidade-label">Tags da comunidade</label>
                      <TagsDropdown id="tags-comunidade" selectedTags={tags} setSelectedTags={setTags} placeholder="Selecione gêneros da comunidade" />
                      {errors.tags && <span className="text-red-500 text-xs">{errors.tags}</span>}
                    </div>
                </div>
                {/* Upload de imagem de capa */}
                <div className="flex flex-col items-start">
                  <div className="w-40 h-40 bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-400 text-sm overflow-hidden">
                    {fotoPreview ? (
                      <img src={fotoPreview} alt="Prévia" className="w-full h-full object-cover" />
                    ) : (
                      'Prévia'
                    )}
                  </div>
                  <label htmlFor="upload-capa" className="text-b1 mb-2">Imagem de capa</label>
                  <input
                    id="upload-capa"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFotoChange}
                  />
                  <Button
                    type="button"
                    text="Upload de capa"
                    icon={<ShareIcon />}
                    size="small"
                    colorScheme="light-green"
                    onClick={() => {
                      const input = document.getElementById('upload-capa');
                      if (input) input.click();
                    }}
                  />
                </div>
              </div>
              <div className="mb-4 flex justify-center">
                <Button
                  type="submit"
                  text={isLoading ? 'Salvando...' : 'Salvar alterações'}
                  icon={<CheckIcon />}
                  size="large"
                  colorScheme="dark-green"
                  disabled={isLoading}
                />
              </div>
            </form>
            {isLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
                <LoadingPage />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div> <LoadingPage /></div>}>
      <EditCommunityPage />
    </Suspense>
  );
}