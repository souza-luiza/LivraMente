'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon';
import Input from '@/components/general-input';
import TagsDropdown from '@/components/tags-dropdown';
import { communityService } from '@/services/comunidade';
import Button from '@/components/button';
import LoadingPage from '@/components/loading';
import { titleToSlug } from '@/lib/slugify';
import PopUp from '@/components/pop-up';
import CommunityIcon from '@/components/icons/CommunityIcon';
import TrashIcon from '@/components/icons/TrashIcon';
import ImageIcon from '@/components/icons/ImageIcon';
import AddIcon from '@/components/icons/AddIcon';
import Image from 'next/image';
import { CommunityTags, CreateCommunityData } from '@/types/comunidade';
import WidgetChat from '@/components/widget-chat';

export default function CreateCommunityPage() {
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' | null }>({ text: '', type: null });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ nome?: string; descricao?: string; tags?: string; foto?: string }>({});
  const [communitySlug, setCommunitySlug] = useState<string | null>(null);

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

  // Validação dos campos
  const validate = () => {
    const newErrors: typeof errors = {};
    if (!nome.trim()) newErrors.nome = 'O nome é obrigatório.';
    if (!tags || tags.length === 0) newErrors.tags = 'As tags são obrigatórias.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      //let imagem_url: string | undefined = undefined;
      //if (foto) {
      //  imagem_url = await communityService.uploadImage(foto);
      //}
      const slug = titleToSlug(nome);
      const payload: CreateCommunityData = {
        nome,
        descricao,
        tags: tags.map(tag => tag.toLowerCase()),
        slug,
      };
      await communityService.createCommunity(payload)
      setCommunitySlug(slug);
      setMessage({ text: 'Comunidade criada com sucesso!', type: 'success' });
      setIsLoading(false);
    } catch (err) {
      setMessage({ text: 'Erro ao criar comunidade.', type: 'error' });
      setIsLoading(false);
    }
  };
  return (
    <>
    <div className="flex w-full h-screen items-center bg-white">
      <Sidebar />
      {message.text ? (
        <PopUp
          title={message.type === 'error' ? 'Uh-oh!' : 'Sucesso!'}
          description={message.text}
          button1={{ text: "Voltar para Comunidades", icon: <ArrowLeftIcon />, colorScheme: message.type === 'error' ? 'light-brown' : 'dark-green', onClick: () => {
            setMessage({ text: '', type: null });
            router.push('/comunidades');
          }}}
          button2={message.type === 'success' ? { text: "Ir para Comunidade", icon: <CommunityIcon />, colorScheme: 'light-green', onClick: () => {
            setMessage({ text: '', type: null });
            router.push(`/comunidade/${communitySlug}`);
          }} : undefined}
          isOpen={true}
        />
        ) : (
          <div className="w-full flex flex-col light-neutral p-10">
            <div 
              className="flex flex-row items-center pb-2 mb-4 gap-2"
              style={{ borderBottomWidth: 'var(--small-border-width)', borderBottomColor: 'var(--color-gray-200)' }}
            >
              <CommunityIcon size={32} />
              <h1 className="text-h4">Criar Comunidade</h1>
            </div>
            {/* Formulário de edição de comunidade */}
            <form id="form-criar-comunidade" className="w-full flex flex-row p-4" onSubmit={handleSubmit}>
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
              className="flex flex-row gap-1 justify-end pt-4 mt-2"
              style={{ borderTopWidth: 'var(--small-border-width)', borderTopColor: 'var(--color-gray-200)' }}
            >
              <Button
                text="Cancelar"
                icon={<TrashIcon />}
                size="medium"
                colorScheme="light-brown"
                disabled={isLoading}
                path={`/comunidades`}
              />
              <Button
                type="submit"
                form="form-criar-comunidade"
                text={isLoading ? 'Criando...' : 'Criar'}
                icon={<AddIcon />}
                size="medium"
                colorScheme="light-green"
                disabled={isLoading}
              />
            </div>
            {isLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
                <LoadingPage />
              </div>
            )}
          </div>
      )}
    </div>
    <WidgetChat />
    </>
  );
}