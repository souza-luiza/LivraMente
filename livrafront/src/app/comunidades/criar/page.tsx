'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image';

// Ícones
import CommunityIcon from '@/components/icons/CommunityIcon';
import AddIcon from '@/components/icons/AddIcon';
import LoaderIcon from '@/components/icons/LoaderIcon';
import RemoveIcon from '@/components/icons/RemoveIcon';
import TrashIcon from '@/components/icons/TrashIcon';

// Componentes
import Button from '@/components/button';
import Input from '@/components/general-input';
import Sidebar from '@/components/sidebar';
import TagsDropdown from '@/components/tags-dropdown';
import ImageCropModal from '@/components/ImageCropModal';
import BannerCropModal from '@/components/BannerCropModal';
import ToastNotification from '@/components/toast-notification';
import LoadingPage from '@/components/loading';

// Integração com a API
import { communityService } from '@/services/comunidade';

// Tipos
import { CommunityTags, Comunidade, CreateCommunityData, CreateCommunityPayload } from '@/types/comunidade';

// Funções Auxiliares
import { titleToSlug } from '@/lib/slugify';
import BookCard from '@/components/book';
import AddBook from '@/components/add-book-to-community';
import { Livro } from '@/types/livros';
import RefreshIcon from '@/components/icons/RefreshIcon';

export default function CreateCommunityPage() {

  const router = useRouter();

  const [CommunityData, setCommunityData] = useState<CreateCommunityData>({
    nome: '',
    capaUrl: '',
    bannerUrl: '',
    descricao: '',
    tags: [],
    livro: undefined,
    slug: ''
  });
  const [selectedBook, setSelectedBook] = useState<Livro>();

  // Carregando e Erros
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errors, setErrors] = useState<{ nome?: string; descricao?: string; tags?: string; capa?: string, banner?: string, livro?: string }>({});

  // Refs para os inputs das imagens
  const fileCoverInputRef = useRef<HTMLInputElement>(null);
  const fileBannerInputRef = useRef<HTMLInputElement>(null);

  // Estados para Crop de Imagem
  const [tempImageUrl, setTempImageUrl] = useState<string>("");
  const [croppedCoverBlob, setCroppedCoverBlob] = useState<Blob | null>(null);
  const [croppedBannerBlob, setCroppedBannerBlob] = useState<Blob | null>(null);
  const [showCoverCropModal, setShowCoverCropModal] = useState(false);
  const [showBannerCropModal, setShowBannerCropModal] = useState(false);

  // Estados para apagar imagens temporárias
  const [isCoverImageHovered, setIsCoverImageHovered] = useState(false);
  const [isBannerImageHovered, setIsBannerImageHovered] = useState(false);

  // Adicionar Livro
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showChangeBookButton, setShowChangeBookButton] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (errors.nome) {
      setErrors({
        ...errors,
        nome: undefined
      });
    }

    setCommunityData({
      ...CommunityData,
      nome: e.target.value
    });
  }

  const handleTagsChange = (selectedTags: string[]) => {
    if (errors.tags) {
      setErrors({
        ...errors,
        tags: undefined
      });
    }

    setCommunityData({
      ...CommunityData,
      tags: selectedTags
    });
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommunityData({
      ...CommunityData,
      descricao: e.target.value
    });
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, imageType: 'cover' | 'banner') => {
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
      if (imageType === 'cover') {
        setShowCoverCropModal(true);
      } else if (imageType === 'banner') {
        setShowBannerCropModal(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCropSave = (croppedBlob: Blob, imageType: 'cover' | 'banner') => {
    if (imageType === 'cover') {
      setCroppedCoverBlob(croppedBlob);
    } else if (imageType === 'banner') {
      setCroppedBannerBlob(croppedBlob);
    }

    const previewUrl = URL.createObjectURL(croppedBlob);

    if (imageType === 'cover') {
      setCommunityData({
        ...CommunityData, 
        capaUrl: previewUrl
      });

      setShowCoverCropModal(false);

    } else if (imageType === 'banner') {
      setCommunityData({
        ...CommunityData,
        bannerUrl: previewUrl
      });

      setShowBannerCropModal(false);
    }

    toast.info(`${(imageType === 'cover') ? 'Imagem de capa pronta' : 'Banner pronto'}!`);
  };

  const handleCropCancel = (imageType: 'cover' | 'banner') => {
    setTempImageUrl("");
    
    if (imageType === 'cover' && fileCoverInputRef.current) {
      setShowCoverCropModal(false);
      fileCoverInputRef.current.value = "";
    } else if (imageType === 'banner' && fileBannerInputRef.current) {
      setShowBannerCropModal(false);
      fileBannerInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (imageType: 'cover' | 'banner') => {
    setTempImageUrl("");  

    if (imageType === 'cover') {
      if (croppedCoverBlob) {
        URL.revokeObjectURL(CommunityData.capaUrl ?? "");
        setCroppedCoverBlob(null);
      }
      if (fileCoverInputRef.current) {
        fileCoverInputRef.current.value = "";
      }
      setCommunityData({
        ...CommunityData,
        capaUrl: ''
      });
    } else if (imageType === 'banner') {
      if (croppedBannerBlob) {
        URL.revokeObjectURL(CommunityData.bannerUrl ?? "");
        setCroppedBannerBlob(null);
      }
      if (fileBannerInputRef.current) {
        fileBannerInputRef.current.value = "";
      }
      setCommunityData({
        ...CommunityData,
        bannerUrl: ''
      });
    }

    toast.info(`${imageType === 'cover' ? 'Imagem de capa romovida' : 'Banner removido'}.`);
  };

  const handleSelectBook = (book: Livro) => {
    if (!CommunityData) return;

    if (errors.livro) {
      setErrors({
        ...errors,
        livro: undefined
      });
    }

    setSelectedBook(book);
    setCommunityData({
      ...CommunityData,
      livro: book
    });
  }

  const handleCancel = () => {
    setIsRedirecting(true);

    if (croppedCoverBlob) {
      URL.revokeObjectURL(CommunityData.capaUrl ?? "");
      setCroppedCoverBlob(null);
    }

    if (croppedBannerBlob) {
      URL.revokeObjectURL(CommunityData.bannerUrl ?? "");
      setCroppedBannerBlob(null);
    }
    
    setCommunityData({
      nome: '',
      descricao: '',
      tags: [],
      capaUrl: '',
      bannerUrl: '',
      livro: undefined,
      slug: ''
    });
    
    router.back();
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!CommunityData.nome.trim()) {
      newErrors.nome = 'O nome é obrigatório.';
    }

    if (!CommunityData.livro) {
      newErrors.livro = 'O livro da comunidade é obrigatório.';
    }

    if (!CommunityData.tags || CommunityData.tags.length === 0) {
      newErrors.tags = 'As tags são obrigatórias.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Preencha os campos obrigatórios antes de prosseguir.');
      return;
    }

    try {

      setIsLoading(true);

      // Preparação do payload
      const communityPayload: CreateCommunityPayload = {
        nome: CommunityData.nome,
        descricao: CommunityData.descricao,
        tags: CommunityData.tags,
        livro: CommunityData.livro?._id,
        slug: titleToSlug(CommunityData.nome),
      };

      delete communityPayload.capaUrl;
      delete communityPayload.bannerUrl;

      // Criação da Comunidade
      const newCommunity: Comunidade = await communityService.createCommunity(communityPayload)

      toast.success('Comunidade criada com sucesso!');

      setIsRedirecting(true);

      // Upload da imagem de capa, se houver
      try {

        if (croppedCoverBlob) {
          const formDataUpload = new FormData();
          formDataUpload.append('file', croppedCoverBlob, 'capa.jpg');

          const response = await communityService.uploadCapa(newCommunity.nome, formDataUpload);
          
          setCommunityData({
            ...CommunityData,
            capaUrl: response.capaUrl
          })
        }

      } catch (err) {

        toast.error('Erro ao fazer upload da imagem de capa da comunidade.');
      }

      // Upload do banner, se houver
      try {

        if (croppedBannerBlob) {
          const formDataUpload = new FormData();
          formDataUpload.append('file', croppedBannerBlob, 'banner.jpg');

          const response = await communityService.uploadBanner(newCommunity.nome, formDataUpload);

          setCommunityData({
            ...CommunityData,
            bannerUrl: response.bannerUrl
          })
        }

      } catch (err) {

        toast.error('Erro ao fazer upload do banner da comunidade.');
      }

      // Mudar para a página da comunidade criada
      router.push(`/comunidade/${titleToSlug(newCommunity.nome)}`);

    } catch (err) {

      toast.error('Erro ao criar comunidade.');
      router.back();
      
    } finally {

      setIsLoading(false);

    }
  };

  if (isRedirecting) return <LoadingPage />;

  return (
    <div 
      className="max-h-screen flex bg-gray-50"
      style={{ color: 'var(--secondary-800)' }}
    >

      <Sidebar />

      <main className="w-full flex flex-col justify-between m-4">
        {/* Cabeçalho */}
        <div 
          className="w-full flex flex-row items-center pb-2 gap-2"
          style={{ borderBottomWidth: 'var(--small-border-width)', borderBottomColor: 'var(--color-gray-200)' }}
        >
          <CommunityIcon size={32} />
          <h1 className="text-h4">
            Criar Comunidade
          </h1>
        </div>

        {/* Formulário de edição de comunidade */}
        <form 
          id="form-criar-comunidade"
          className="w-full flex flex-col gap-4"
          onSubmit={handleSubmit}
        >
          {/* Preview do Header */}
          <div className="w-full flex flex-col gap-1">
            <label className="text-h6">Preview do Header</label>

            <div className="w-full flex flex-col large-border-radius small-padding shadow-md light-neutral">
              <div
                className="relative w-full h-36 flex overflow-hidden large-border-radius items-center justify-center bg-[#D9D9D9]"
                onMouseEnter={() => setIsBannerImageHovered(true)}
                onMouseLeave={() => setIsBannerImageHovered(false)}
              >
                {isBannerImageHovered && !CommunityData.bannerUrl &&
                <div 
                  className="w-full h-full inset-0 z-10 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                >
                  <Button
                    type="button"
                    text="Adicionar Banner"
                    icon={<AddIcon />}
                    colorScheme="dark-green"
                    size="medium"
                    onClick={() => fileBannerInputRef.current?.click()}
                  />
                </div>}
                {CommunityData.bannerUrl && <Image
                    src={CommunityData.bannerUrl}
                    alt="Preview Banner Image"
                    fill
                    className="object-cover"
                />}
                {isBannerImageHovered && CommunityData.bannerUrl && 
                <div 
                  className="w-full h-full inset-0 z-10 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                >
                  <Button
                    type="button"
                    icon={<TrashIcon />}
                    colorScheme="dark-brown"
                    size="medium"
                    onClick={() => handleRemoveImage('banner')}
                  />
                </div>}
                {!isBannerImageHovered && !CommunityData.bannerUrl && 
                <p className="text-b2 body-quotation">
                  Nenhum banner selecionado!
                </p>}
                <input
                  ref={fileBannerInputRef}
                  type="file"
                  accept="image/*"
                  disabled={isLoading || isRedirecting}
                  onChange={(e) => handleImageChange(e, 'banner')}
                  style={{ display: "none" }}
                />
              </div>
              <div className="flex flex-row flex-shrink-0 items-start gap-3 mt-2 px-4">
                {/* Foto da Comunidade */}
                <div
                  className="relative flex-shrink-0 w-24 h-24 rounded-full overflow-hidden"
                  onMouseEnter={() => setIsCoverImageHovered(true)}
                  onMouseLeave={() => setIsCoverImageHovered(false)}
                >
                  {isCoverImageHovered && !CommunityData.capaUrl &&
                  <div 
                    className="absolute w-full h-full inset-0 z-10 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                  >
                    <Button
                      type="button"
                      icon={<AddIcon />}
                      colorScheme="dark-green"
                      size="medium"
                      onClick={() => fileCoverInputRef.current?.click()}
                    />
                  </div>}
                  <Image
                      src={CommunityData.capaUrl ? CommunityData.capaUrl : "/CommunityDefault.png"}
                      alt="Preview Cover Image"
                      fill
                      className="object-cover"
                  />
                  {isCoverImageHovered && CommunityData.capaUrl &&
                  <div 
                    className="absolute w-full h-full inset-0 z-10 flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                  >
                    <Button
                      type="button"
                      icon={<TrashIcon />}
                      colorScheme="dark-brown"
                      size="small"
                      onClick={() => handleRemoveImage('cover')}
                    />
                  </div>}
                  <input
                    ref={fileCoverInputRef}
                    type="file"
                    accept="image/*"
                    disabled={isLoading || isRedirecting}
                    onChange={(e) => handleImageChange(e, 'cover')}
                    style={{ display: "none" }}
                  />
                </div>
                {/* Info da Comunidade */}
                <div className="w-full flex flex-col gap-1">
                    <h1 className="text-h4">
                        {CommunityData.nome ? CommunityData.nome : 'Nome da Comunidade'}
                    </h1>
                    <p className="text-b2 text-justify line-clamp-4">
                        {CommunityData.descricao ? CommunityData.descricao : 'Adicione uma descrição legal para a sua nova comunidade!'}
                    </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full flex flex-row gap-4">
            <div className="w-3/5 flex flex-col gap-2">
              <div className="w-full flex flex-row gap-4">
                {/* Nome */}
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-h6">Nome</label>
                  <Input
                    id="nome-comunidade"
                    placeholder="Digite o nome da comunidade"
                    className="w-full"
                    disabled={isLoading || isRedirecting}
                    value={CommunityData.nome}
                    onChange={handleNameChange}
                  />
                  {errors.nome &&
                  <span className="text-red-500 text-b3">
                      {errors.nome}
                  </span>}
                </div>
                {/* Tags */}
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-h6">Tags</label>
                  <TagsDropdown 
                    id="tags-comunidade"
                    tags={CommunityTags}
                    selectedTags={CommunityData.tags ?? []}
                    setSelectedTags={(selected) => handleTagsChange(selected)}
                    placeholder="Selecione gêneros da comunidade"
                    disabled={isLoading || isRedirecting}
                  />
                  {errors.tags && <span className="text-red-500 text-xs">{errors.tags}</span>}
                </div>
              </div>

              {/* Descrição */}
              <div className="w-full flex flex-col gap-1">
                <label className="text-h6">Descrição</label>
                <textarea
                  placeholder="Digite a descrição da comunidade"
                  className="transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-gray-400 text-gray-900 border border-gray-300 bg-white focus:ring-green-900 focus:border-green-900 hover:border-gray-400 medium-box text-b2 w-full light-neutral resize-none"
                  value={CommunityData.descricao}
                  disabled={isLoading || isRedirecting}
                  onChange={handleDescriptionChange}
                />
                {errors.descricao &&
                <span className="text-red-500 text-xs">
                  {errors.descricao}
                </span>}
              </div>
            </div>

            {/*Livro da Comunidade*/}
            <div className="w-2/5 flex flex-col gap-1">
              <label className="text-h6">Livro</label>
              <div
                className="relative w-full h-full flex flex-col items-center justify-center medium-box border border-gray-300 hover:border-gray-400 bg-white overflow-hidden gap-1"
                onMouseEnter={() => setShowChangeBookButton(true)}
                onMouseLeave={() => setShowChangeBookButton(false)}
              >
                {selectedBook ? (
                    <>
                      <BookCard book={selectedBook} disabled={true} />
                      {showChangeBookButton &&
                      <div
                        className="absolute w-full h-full inset-0 z-10 flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                      >
                        <Button
                          type="button"
                          text="Alterar Livro"
                          icon={<RefreshIcon />}
                          colorScheme="dark-green"
                          size="medium"
                          onClick={() => setShowAddBookModal(true)} 
                        />
                      </div>}
                    </>
                ) : (
                    <>
                      <p className="text-b2 body-quotation">Nenhum livro selecionado!</p>
                      <Button
                        type="button"
                        text="Adicionar Livro à Comunidade"
                        icon={<AddIcon />}
                        colorScheme="dark-green"
                        size="medium"
                        onClick={() => setShowAddBookModal(true)} 
                      />
                    </>
                  )}
              </div>
              {errors.livro &&
              <span className="text-red-500 text-b3">
                  {errors.livro}
              </span>}
            </div>
          </div>
        </form>

        {/* Cancelar e Criar */}
        <div 
          className="w-full flex flex-row justify-end gap-1 pt-4"
          style={{ borderTopWidth: 'var(--small-border-width)', borderTopColor: 'var(--color-gray-200)' }}
        >
          <Button
            text="Cancelar"
            icon={<RemoveIcon />}
            size="medium"
            colorScheme="light-brown"
            disabled={isLoading || isRedirecting}
            onClick={handleCancel}
          />
          <Button
            type="submit"
            form="form-criar-comunidade"
            text={isLoading ? 'Criando...' : 'Criar Comunidade'}
            icon={isLoading ? <LoaderIcon /> : <AddIcon />}
            size="medium"
            colorScheme="light-green"
            disabled={isLoading || isRedirecting}
          />
        </div>
      </main>

      <ImageCropModal
        isOpen={showCoverCropModal}
        imageUrl={tempImageUrl}
        onClose={() => handleCropCancel('cover')}
        onSave={(blob) => handleCropSave(blob, 'cover')}
      />
      <BannerCropModal
        isOpen={showBannerCropModal}
        imageUrl={tempImageUrl}
        onClose={() => handleCropCancel('banner')}
        onSave={(blob) => handleCropSave(blob, 'banner')}
      />
      <AddBook
        isOpen={showAddBookModal}
        livroComunidade={CommunityData.livro?._id}
        onClose={() => setShowAddBookModal(false)}
        onBookChange={(livroInfo) => handleSelectBook(livroInfo)}
      />
      <ToastNotification />

    </div>
    <WidgetChat />
    </>
  );
}