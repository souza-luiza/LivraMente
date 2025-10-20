'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Sidebar from '@/components/sidebar';
import Button from '@/components/button';
import GeneralInput from '@/components/general-input';
import SearchIcon from '@/components/icons/SearchIcon';
import EditIcon from '@/components/icons/EditIcon';
import SaveIcon from '@/components/icons/SaveIcon';
import DeleteIcon from '@/components/icons/DeleteIcon';
import ErrorIcon from '@/components/icons/ErrorIcon';

interface Book {
  id: number;
  title: string;
  year: string;
  pages: string;
  rating: number;
  cover: string;
}

export default function EditReadlistPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToRemove, setBookToRemove] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado inicial da readlist
  const [readlistData, setReadlistData] = useState({
    title: "Livros 2025",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    coverImage: "/kemi-teste.jpg",
    isPrivate: false,
    books: [
      { id: 1, title: "Jantar Secreto", year: "2016", pages: "416 pags", rating: 5, cover: "/kemi-teste.jpg" },
      { id: 2, title: "A Empregada", year: "2018", pages: "208 pags", rating: 5, cover: "/kemi-teste.jpg" },
      { id: 3, title: "Recursão", year: "2020", pages: "300 pags", rating: 5, cover: "/kemi-teste.jpg" },
    ] as Book[]
  });

  const [errors, setErrors] = useState({
    title: '',
    description: ''
  });

  const validateForm = () => {
    const newErrors = {
      title: '',
      description: ''
    };

    if (!readlistData.title.trim()) {
      newErrors.title = 'O título é obrigatório';
    } else if (readlistData.title.length > 100) {
      newErrors.title = 'O título deve ter no máximo 100 caracteres';
    }

    if (readlistData.description.length > 500) {
      newErrors.description = 'A descrição deve ter no máximo 500 caracteres';
    }

    setErrors(newErrors);
    return !newErrors.title && !newErrors.description;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // Aqui você faria a chamada para a API para salvar as alterações
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulação
      console.log('Readlist atualizada:', readlistData);
      router.push('/readlist');
    } catch (error) {
      console.error('Erro ao salvar readlist:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleRemoveBook = (bookId: number) => {
    setBookToRemove(bookId);
    setShowDeleteModal(true);
  };

  const confirmRemoveBook = () => {
    if (bookToRemove !== null) {
      setReadlistData(prev => ({
        ...prev,
        books: prev.books.filter(book => book.id !== bookToRemove)
      }));
    }
    setShowDeleteModal(false);
    setBookToRemove(null);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Aqui você faria o upload da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setReadlistData(prev => ({
          ...prev,
          coverImage: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredBooks = readlistData.books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Sidebar Fixa */}
      <div className="hidden lg:flex min-h-screen bg-[#E5EEDF]">
        <Sidebar />
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-[200px] py-8 md:py-12" style={{ maxWidth: '1500px' }}>
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-h1" style={{ color: 'var(--secondary-700)' }}>
              Editar Readlist
            </h1>
            <div className="flex gap-3">
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                variant="filled"
                onClick={handleSave}
                disabled={isSaving}
                icon={<SaveIcon size={20} />}
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>

        {/* Formulário de Edição */}
        <div className="space-y-8">
          
          {/* Seção 1: Informações Básicas */}
          <div 
            className="p-6 rounded-lg"
            style={{ 
              backgroundColor: 'var(--primary-200)',
              borderRadius: 'var(--large-border-radius)'
            }}
          >
            <h2 className="text-h3 mb-6" style={{ color: 'var(--secondary-700)' }}>
              Informações Básicas
            </h2>

            <div className="space-y-6">
              {/* Título */}
              <div>
                <GeneralInput
                  label="Título da Readlist"
                  type="text"
                  value={readlistData.title}
                  onChange={(e) => setReadlistData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Digite o título da readlist"
                  error={errors.title}
                  maxLength={100}
                />
                <p className="text-b2 mt-1" style={{ color: 'var(--secondary-600)' }}>
                  {readlistData.title.length}/100 caracteres
                </p>
              </div>

              {/* Descrição */}
              <div>
                <label className="text-b1 block mb-2" style={{ color: 'var(--secondary-700)' }}>
                  Descrição
                </label>
                <textarea
                  value={readlistData.description}
                  onChange={(e) => setReadlistData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva sua readlist"
                  maxLength={500}
                  rows={4}
                  className="w-full p-3 rounded-lg text-b2 outline-none resize-none"
                  style={{
                    backgroundColor: 'var(--primary-300)',
                    color: 'var(--secondary-800)',
                    border: errors.description ? '1px solid var(--error-500)' : 'none'
                  }}
                />
                <div className="flex justify-between mt-1">
                  <p className="text-b2" style={{ color: errors.description ? 'var(--error-500)' : 'var(--secondary-600)' }}>
                    {errors.description || `${readlistData.description.length}/500 caracteres`}
                  </p>
                </div>
              </div>

              {/* Imagem de Capa */}
              <div>
                <label className="text-b1 block mb-2" style={{ color: 'var(--secondary-700)' }}>
                  Imagem de Capa
                </label>
                <div className="flex gap-4 items-start">
                  <div 
                    className="relative overflow-hidden flex-shrink-0"
                    style={{ 
                      width: '150px',
                      height: '150px',
                      borderRadius: 'var(--medium-border-radius)',
                      backgroundColor: 'var(--secondary-300)'
                    }}
                  >
                    <Image 
                      src={readlistData.coverImage}
                      alt="Capa da readlist"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="hidden"
                      id="cover-upload"
                    />
                    <label 
                      htmlFor="cover-upload"
                      className="inline-block cursor-pointer"
                    >
                      <Button variant="outlined" icon={<EditIcon size={20} />}>
                        Alterar Imagem
                      </Button>
                    </label>
                    <p className="text-b2 mt-2" style={{ color: 'var(--secondary-600)' }}>
                      Formatos aceitos: JPG, PNG. Tamanho máximo: 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Privacidade */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is-private"
                  checked={readlistData.isPrivate}
                  onChange={(e) => setReadlistData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                  className="w-5 h-5 cursor-pointer"
                />
                <label htmlFor="is-private" className="text-b1 cursor-pointer" style={{ color: 'var(--secondary-700)' }}>
                  Tornar esta readlist privada
                </label>
              </div>
            </div>
          </div>

          {/* Seção 2: Gerenciar Livros */}
          <div 
            className="p-6 rounded-lg"
            style={{ 
              backgroundColor: 'var(--secondary-200)',
              borderRadius: 'var(--large-border-radius)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-h3" style={{ color: 'var(--secondary-700)' }}>
                Livros ({readlistData.books.length})
              </h2>
              <Button variant="filled">
                Adicionar Livros
              </Button>
            </div>

            {/* Barra de Pesquisa */}
            <div className="mb-6">
              <div 
                className="flex items-center gap-3"
                style={{ 
                  backgroundColor: 'var(--secondary-100)',
                  borderRadius: '999px',
                  padding: '12px var(--medium-padding)'
                }}
              >
                <SearchIcon size={20} style={{ color: 'var(--secondary-700)' }} />
                <input 
                  type="text" 
                  placeholder="Pesquisar livros na readlist"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent flex-1 outline-none text-b2"
                  style={{ 
                    color: 'var(--secondary-800)',
                    border: 'none'
                  }}
                />
              </div>
            </div>

            {/* Lista de Livros */}
            <div className="space-y-4">
              {filteredBooks.length === 0 ? (
                <p className="text-center text-b1 py-8" style={{ color: 'var(--secondary-600)' }}>
                  {searchTerm ? 'Nenhum livro encontrado' : 'Nenhum livro adicionado'}
                </p>
              ) : (
                filteredBooks.map((book) => (
                  <div 
                    key={book.id}
                    className="flex gap-4 items-center p-4 rounded-lg"
                    style={{ 
                      backgroundColor: 'var(--background)',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    {/* Capa do Livro */}
                    <div 
                      className="relative overflow-hidden flex-shrink-0"
                      style={{ 
                        width: '60px',
                        height: '80px',
                        borderRadius: 'var(--small-border-radius)'
                      }}
                    >
                      <Image 
                        src={book.cover}
                        alt={book.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Informações do Livro */}
                    <div className="flex-1">
                      <h3 className="text-b1 body-semibold" style={{ color: 'var(--secondary-800)' }}>
                        {book.title}
                      </h3>
                      <p className="text-b2" style={{ color: 'var(--secondary-700)' }}>
                        {book.year} • {book.pages}
                      </p>
                    </div>

                    {/* Botão Remover */}
                    <button
                      onClick={() => handleRemoveBook(book.id)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ 
                        color: 'var(--error-500)',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--error-100)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      aria-label={`Remover ${book.title}`}
                    >
                      <DeleteIcon size={24} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            className="max-w-md w-full p-6 rounded-lg"
            style={{ backgroundColor: 'var(--background)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-h3" style={{ color: 'var(--secondary-700)' }}>
                Remover Livro
              </h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="p-1"
                aria-label="Fechar"
              >
                <ErrorIcon size={24} style={{ color: 'var(--secondary-600)' }} />
              </button>
            </div>
            
            <p className="text-b1 mb-6" style={{ color: 'var(--secondary-700)' }}>
              Tem certeza que deseja remover este livro da readlist?
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outlined"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="filled"
                onClick={confirmRemoveBook}
                style={{ backgroundColor: 'var(--error-500)' }}
              >
                Remover
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
