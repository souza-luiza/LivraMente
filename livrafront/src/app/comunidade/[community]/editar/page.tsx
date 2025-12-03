'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
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
import AddBook from '@/components/add-book-to-community';

// Integração com a API
import { communityService } from '@/services/comunidade';

// Tipos
import { CommunityTags, Comunidade, UpdateCommunityData, UpdateCommunityPayload } from '@/types/comunidade';

// Funções Auxiliares
import { slugToTitle, titleToSlug } from '@/lib/slugify';
import SaveIcon from '@/components/icons/SaveIcon';
import PopUp from '@/components/pop-up';
import BookCard from '@/components/book';
import { Livro } from '@/types/livros';
import RefreshIcon from '@/components/icons/RefreshIcon';

export default function CreateCommunityPage() {

  const router = useRouter();
  const params = useParams();
  const { community } = params as { community: string };

  const [originalCommunityData, setOriginalCommunityData] = useState<Comunidade>();
  const [editedCommunityData, setEditedCommunityData] = useState<UpdateCommunityData>();
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

  // Apagar comunidade
  const [showConfirmDeletePopUp, setShowConfirmDeletePopUp] = useState(false);

  // Adicionar Livro
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showChangeBookButton, setShowChangeBookButton] = useState(false);

  useEffect(() => {

    const fetchCommunityData = async () => {

      try {
        setIsRedirecting(true);

        // Conversão de slug para nome da comunidade
        const communityName = slugToTitle(community);

        // Busca dos dados da comunidade
        const communityData = await communityService.getComunidadeByName(communityName);
        if (!communityData) {
          toast.error('Comunidade não encontrada.');
          router.replace("/not-found");
          return;
        }

        // Inicialização dos estados da comunidade
        setOriginalCommunityData(communityData);
        setEditedCommunityData({
          nome: communityData.nome,
          descricao: communityData.descricao,
          capaUrl: communityData.capaUrl === '/CommunityDefault.png' ? '' : communityData.capaUrl,
          bannerUrl: communityData.bannerUrl,
          tags: communityData.tags,
          livro: communityData.livro,
          slug: communityData.slug
        });
        setSelectedBook(communityData.livro);

      } catch (err) {

        toast.error('Erro ao carregar dados da comunidade.');
        router.back();

      } finally {

        setIsRedirecting(false);
      }

    }

    fetchCommunityData();

  }, [community, router]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (errors.nome) {
      setErrors({
        ...errors,
        nome: undefined
      });
    }

    setEditedCommunityData({
      ...editedCommunityData,
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

    setEditedCommunityData({
      ...editedCommunityData,
      tags: selectedTags
    });
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedCommunityData({
      ...editedCommunityData,
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
      setEditedCommunityData({
        ...editedCommunityData, 
        capaUrl: previewUrl
      });

      setShowCoverCropModal(false);

    } else if (imageType === 'banner') {
      setEditedCommunityData({
        ...editedCommunityData,
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
    if (!originalCommunityData || !editedCommunityData) return;
    
    setTempImageUrl("");

    if (imageType === 'cover') {
      if (croppedCoverBlob) {
        URL.revokeObjectURL(editedCommunityData.capaUrl ?? "");
        setCroppedCoverBlob(null);
      }
      if (fileCoverInputRef.current) {
        fileCoverInputRef.current.value = "";
      }
      setEditedCommunityData({
        ...editedCommunityData,
        capaUrl: ''
      });
    } else if (imageType === 'banner') {
      if (croppedBannerBlob) {
        URL.revokeObjectURL(editedCommunityData.bannerUrl ?? "");
        setCroppedBannerBlob(null);
      }
      if (fileBannerInputRef.current) {
        fileBannerInputRef.current.value = "";
      }
      setEditedCommunityData({
        ...editedCommunityData,
        bannerUrl: ''
      });
    }

    toast.info(`${imageType === 'cover' ? 'Imagem de capa romovida' : 'Banner removido'}.`);
  };

  const handleCancel = () => {
    if (!originalCommunityData || !editedCommunityData) return;

    setIsRedirecting(true);

    if (croppedCoverBlob) {
      URL.revokeObjectURL(editedCommunityData.capaUrl ?? "");
      setCroppedCoverBlob(null);
    }

    if (croppedBannerBlob) {
      URL.revokeObjectURL(editedCommunityData.bannerUrl ?? "");
      setCroppedBannerBlob(null);
    }
    
    setEditedCommunityData({
      nome: originalCommunityData.nome,
      descricao: originalCommunityData.descricao,
      tags: originalCommunityData.tags,
      capaUrl: originalCommunityData.capaUrl,
      bannerUrl: originalCommunityData.bannerUrl,
      livro: originalCommunityData.livro,
      slug: originalCommunityData.slug
    });
    
    router.back();
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!editedCommunityData) return;

    if (editedCommunityData.nome && !editedCommunityData.nome.trim()) {
      newErrors.nome = 'O nome é obrigatório.';
    }

    if (editedCommunityData.tags && (!editedCommunityData.tags || editedCommunityData.tags.length === 0)) {
      newErrors.tags = 'As tags são obrigatórias.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const checkCover = () => {
    if (!originalCommunityData || !editedCommunityData) return false;

    const isCoverDefault: boolean = (editedCommunityData.capaUrl === '' && originalCommunityData.capaUrl === '/CommunityDefault.png');
    const hasCoverChanged: boolean = (editedCommunityData.capaUrl !== originalCommunityData.capaUrl && !isCoverDefault);

    return hasCoverChanged;
  }

  const checkBanner = () => {
    if (!originalCommunityData || !editedCommunityData) return false;

    const hasBannerChanged: boolean = (editedCommunityData.bannerUrl !== originalCommunityData.bannerUrl);

    return hasBannerChanged;
  }

  const checkEdits = () => {
    if (!originalCommunityData || !editedCommunityData) return false;

    const editedData = {
      nome: editedCommunityData.nome,
      descricao: editedCommunityData.descricao,
      tags: editedCommunityData.tags,
      livro: editedCommunityData.livro,
      slug: editedCommunityData.slug
    };

    const originalData = {
      nome: originalCommunityData.nome,
      descricao: originalCommunityData.descricao,
      tags: originalCommunityData.tags,
      livro: originalCommunityData.livro,
      slug: originalCommunityData.slug
    };
    
    if (JSON.stringify(editedData) === JSON.stringify(originalData)) return false;

    return true;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editedCommunityData || !originalCommunityData) return;

    if (!validate()) {
      toast.error('Preencha os campos obrigatórios antes de prosseguir.');
      return;
    }

    try {

      setIsLoading(true);

      // Verificar se alguma alteração foi feita, se não, apenas retorna
      const hasCoverChanged   = checkCover();
      const hasBannerChanged  = checkBanner();
      const hasBeenEdited     = checkEdits();

      if (!hasCoverChanged && !hasBannerChanged && !hasBeenEdited) {
        toast.info('Nenhuma alteração feita na comunidade.');
        router.back();
        return;
      }

      let payload: UpdateCommunityPayload = {
        descricao: editedCommunityData.descricao,
        tags: editedCommunityData.tags,
        livro: editedCommunityData.livro?._id,
      };

      // Tira lixo do nome da comunidade e atualiza a slug
      if (editedCommunityData.nome && editedCommunityData.nome !== originalCommunityData.nome) {
        const name = editedCommunityData.nome.trim();
        const slug = titleToSlug(name);

        payload = {
          ...payload,
          nome: name,
          slug: slug
        }
      }

      // Edição da Comunidade
      const updatedCommunity: Comunidade = await communityService.updateCommunity(originalCommunityData.nome, payload)

      toast.success('Comunidade editada com sucesso!');

      setIsRedirecting(true);

      // Upload/Remoção da imagem de capa, se houver
      try {
        
        if (croppedCoverBlob || hasCoverChanged) {

          const formDataUpload = new FormData();

          if (croppedCoverBlob) {
            formDataUpload.append('file', croppedCoverBlob, 'capa.jpg');
          }

          const response = await communityService.uploadCapa(updatedCommunity.nome, formDataUpload);
          
          setEditedCommunityData({
            ...editedCommunityData,
            capaUrl: response.capaUrl
          })

        }

      } catch (err) {

        toast.error('Erro ao fazer upload da imagem de capa da comunidade.');
      }

      // Upload/Remoção do banner, se houver
      try {

        if (croppedBannerBlob || hasBannerChanged) {

          const formDataUpload = new FormData();

          if (croppedBannerBlob) {
            formDataUpload.append('file', croppedBannerBlob, 'banner.jpg');
          }

          const response = await communityService.uploadBanner(updatedCommunity.nome, formDataUpload);

          setEditedCommunityData({
            ...editedCommunityData,
            bannerUrl: response.bannerUrl
          })
        }

      } catch (err) {

        toast.error('Erro ao fazer upload do banner da comunidade.');
      }

      // Mudar para a página da comunidade
      router.push(`/comunidade/${titleToSlug(updatedCommunity.nome)}`);

    } catch (err) {

      toast.error('Erro ao criar comunidade.');
      router.back();
      
    } finally {

      setIsLoading(false);

    }
  };

  const handleDeleteCommunity = async () => {
    if (!originalCommunityData) return;

    try {

      await communityService.deleteCommunity(originalCommunityData.nome);

      toast.success('Comunidade apagada com sucesso!');

      setIsRedirecting(true);

    } catch (err) {

      toast.error('Erro ao apagar comunidade.');
      router.back();

    } finally {
      
      router.push('/comunidades');

    }
  }

  const handleSelectBook = (book: Livro) => {
    if (!editedCommunityData) return;
    setSelectedBook(book);
    setEditedCommunityData({
      ...editedCommunityData,
      livro: book
    });
  }

  if (isRedirecting) return <LoadingPage />;
  
  if (!originalCommunityData || !editedCommunityData) return null;

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
            Editar Comunidade
          </h1>
        </div>

        {/* Formulário de edição de comunidade */}
        <form 
          id="form-editar-comunidade"
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
                {isBannerImageHovered && !editedCommunityData.bannerUrl &&
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
                {editedCommunityData.bannerUrl && <Image
                    src={editedCommunityData.bannerUrl}
                    alt="Preview Banner Image"
                    fill
                    className="object-cover"
                />}
                {isBannerImageHovered && editedCommunityData.bannerUrl && 
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
                {!isBannerImageHovered && !editedCommunityData.bannerUrl && 
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
                  {isCoverImageHovered && !editedCommunityData.capaUrl &&
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
                      src={editedCommunityData.capaUrl ? editedCommunityData.capaUrl : "/CommunityDefault.png"}
                      alt="Preview Cover Image"
                      fill
                      className="object-cover"
                  />
                  {isCoverImageHovered && editedCommunityData.capaUrl &&
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
                        {editedCommunityData.nome ? editedCommunityData.nome : 'Nome da Comunidade'}
                    </h1>
                    <p className="text-b2 text-justify line-clamp-4">
                        {editedCommunityData.descricao ? editedCommunityData.descricao : 'Adicione uma descrição legal para a sua nova comunidade!'}
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
                    value={editedCommunityData.nome}
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
                    selectedTags={editedCommunityData.tags ?? []}
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
                  value={editedCommunityData.descricao}
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
          className="w-full flex flex-row items-center justify-between gap-1 pt-4"
          style={{ borderTopWidth: 'var(--small-border-width)', borderTopColor: 'var(--color-gray-200)' }}
        >
          <Button
            text="Apagar Comunidade"
            icon={<TrashIcon />}
            size="medium"
            colorScheme="light-brown"
            disabled={isLoading || isRedirecting}
            onClick={() => setShowConfirmDeletePopUp(true)}
          />
          <div className="flex flex-row items-center gap-1">
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
              form="form-editar-comunidade"
              text={isLoading ? 'Salvando...' : 'Salvar Alterações'}
              icon={isLoading ? <LoaderIcon /> : <SaveIcon />}
              size="medium"
              colorScheme="light-green"
              disabled={isLoading || isRedirecting}
            />
          </div>
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
      <PopUp
        title="Apagar Comunidade?"
        description="Esta ação não pode ser desfeita."
        isOpen={showConfirmDeletePopUp}
        onClose={() => setShowConfirmDeletePopUp(false)}
        button1={{text: "Cancelar", icon: <RemoveIcon />, colorScheme: "light-green", onClick: () => setShowConfirmDeletePopUp(false)}}
        button2={{text: "Apagar", icon: <TrashIcon />, colorScheme: "light-brown", onClick: handleDeleteCommunity}}
      />
      <AddBook
        isOpen={showAddBookModal}
        livroComunidade={editedCommunityData.livro?._id}
        onClose={() => setShowAddBookModal(false)}
        onBookChange={(livroInfo) => handleSelectBook(livroInfo)}
      />
      <ToastNotification />

    </div>
  );
}