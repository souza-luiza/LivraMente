'use client';

import { useState } from 'react';
import Image from 'next/image';
import Sidebar from '@/components/sidebar';
import SearchIcon from '@/components/icons/SearchIcon';
import LikeIcon from '@/components/icons/LikeIcon';
import ShareIcon from '@/components/icons/ShareIcon';
import ListIcon from '@/components/icons/ListIcon';
import GridIcon from '@/components/icons/GridIcon';
import StarIcon from '@/components/icons/StarIcon';
import HeartIcon from '@/components/icons/HeartIcon';

export default function ReadlistPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLiked, setIsLiked] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const livrosPorPagina = 42;

  const readlist = {
    title: "Livros 2025",
    author: {
      username: "gatanoturna",
      avatar: "/kemi-teste.jpg"
    },
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    progress: {
      read: 20,
      total: 28,
      percentage: 71
    },
    coverImage: "/kemi-teste.jpg",
    books: [
      { id: 1, title: "Jantar Secreto", year: "2016", pages: "416 pags", rating: 5, cover: "/kemi-teste.jpg" },
      { id: 2, title: "A Empregada", year: "2018", pages: "208 pags", rating: 5, cover: "/kemi-teste.jpg" },
      { id: 3, title: "Recursão", year: "2020", pages: "300 pags", rating: 5, cover: "/kemi-teste.jpg" },
      ...Array(livrosPorPagina).fill(null).map((_, i) => ({
        id: i + 4, 
        title: `Livro ${i + 4}`, 
        year: "2023", 
        pages: "250 pags", 
        rating: 4,
        cover: "/kemi-teste.jpg"
      }))
    ]
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Sidebar Fixa */}
      <div className="hidden lg:flex min-h-screen bg-[#E5EEDF]">
        <Sidebar />
      </div>

      {/* Conteúdo Principal */}
      <div 
        className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 md:py-12 w-full max-w-[1600px] mx-auto" 
        style={{ }}
      >
        {/* SEÇÃO 1: Barra de Pesquisa */}
        <div style={{ marginBottom: 'var(--large-padding)' }}>
          <div 
            className="flex items-center gap-3 w-full"
            style={{ 
              backgroundColor: 'var(--primary-300)',
              borderRadius: '999px',
              padding: '12px var(--large-padding)'
            }}
          >
            <SearchIcon size={20} style={{ color: 'var(--primary-700)' }} />
            <input 
              type="text" 
              placeholder="Pesquisar em livros lidos"
              className="bg-transparent flex-1 outline-none text-b2"
              style={{ 
                color: 'var(--primary-800)',
                border: 'none'
              }}
            />
          </div>
        </div>

        {/* SEÇÃO 2: Header da Readlist */}
        <div
          className="light-green w-full flex items-center justify-left"
          style={{
            backgroundColor: 'var(--primary-200)',
            minHeight: '280px',
            padding: 'var(--large-padding)',
            borderRadius: 'var(--large-border-radius)',
            marginBottom: 'var(--large-padding)',
            position: 'relative'
          }}
        >
          {/* Ícones de Ação */}
          <div
            className="flex flex-row md:flex-col gap-2 md:gap-0"
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
            }}
          >
            <button 
              className="textless-medium"
              style={{ 
                backgroundColor: 'transparent',
                transition: 'all 0.3s ease'
              }}
              aria-label="Curtir"
              onClick={() => setIsLiked(!isLiked)}
            >
              <HeartIcon
                size={50}
                style={{ 
                  color: 'var(--primary-600)', 
                  fill: isLiked ? 'var(--primary-600)' : 'none',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }} 
                onMouseEnter={(e) => {
                  if (!isLiked) {
                    e.currentTarget.style.fill = 'var(--primary-400)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLiked) {
                    e.currentTarget.style.fill = 'none';
                  }
                }}
              />
            </button>
            <button 
              className="textless-medium"
              style={{ 
                backgroundColor: 'transparent',
                padding: '0px',
                transition: 'all 0.3s ease'
              }}
              aria-label="Compartilhar"
              onClick={() => setIsShared(!isShared)}
            >
              <ShareIcon 
                size={50}
                style={{ 
                  color: isShared ? 'var(--primary-600)' : 'var(--primary-600)', 
                  opacity: isShared ? 1 : 0.7,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  if (!isShared) {
                    e.currentTarget.style.opacity = '0.7';
                  }
                }}
              />
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center w-full max-w-4xl">
            {/* Imagem de Capa */}
            <div 
              className="relative overflow-hidden flex-shrink-0"
              style={{ 
                width: '200px',
                height: '180px',
                borderRadius: 'var(--large-border-radius)'
              }}
            >
              <Image 
                src={readlist.coverImage}
                alt={readlist.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Informações */}
            <div className="flex flex-col items-center md:items-start justify-center flex-1">
              <h1 className="text-h1 text-center md:text-left" style={{ 
                color: 'var(--secondary-700)',
                marginBottom: 'var(--extra-small-padding)',
                marginTop: '0px'
              }}>
                {readlist.title}
              </h1>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <div 
                  className="relative rounded-full overflow-hidden"
                  style={{ width: '45px', height: '45px' }}
                >
                  <Image 
                    src={readlist.author.avatar}
                    alt={readlist.author.username}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-b1" style={{ color: 'var(--secondary-800)' }}>
                  {readlist.author.username}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SEÇÃO 3: Descrição e Indicador de Progresso */}
        <div className="flex flex-col lg:flex-row gap-6 w-full" style={{ 
          marginBottom: 'var(--large-padding)',
          paddingBottom: 'var(--large-padding)',
          borderBottom: '1px solid var(--secondary-600)',
          alignItems: 'flex-start'
        }}>
          {/* Descrição */}
          <div className="flex-1 w-full">
            <p className="text-b2 w-full" style={{ color: 'var(--secondary-800)', textAlign: 'justify' }}>
              {readlist.description}
            </p>
          </div>

          {/* Indicador de Progresso */}
          <div 
            className="light-brown w-full lg:w-auto lg:max-w-[350px]"
            style={{ 
              backgroundColor: 'var(--secondary-200)',
              borderRadius: 'var(--large-border-radius)',
              padding: 'var(--medium-padding)',
              minWidth: '280px',
              flexShrink: 0
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--extra-small-padding)' }}>
              <div>
                <p className="text-b1" style={{ 
                  color: 'var(--secondary-800)',
                  marginBottom: '2px'
                }}>
                  Você já leu
                </p>
                <p className="text-b1" style={{ 
                  color: 'var(--secondary-800)'
                }}>
                  {readlist.progress.read} de {readlist.progress.total}
                </p>
              </div>
              <p className="text-h3 body-semibold" style={{ 
                color: 'var(--secondary-800)'
              }}>
                {readlist.progress.percentage}%
              </p>
            </div>

            {/* Barra de Progresso */}
            <div 
              style={{ 
                width: '100%',
                height: '8px',
                backgroundColor: 'var(--secondary-100)',
                borderRadius: '4px',
                overflow: 'hidden',
                marginTop: 'var(--extra-small-padding)'
              }}
            >
              <div 
                style={{ 
                  width: `${readlist.progress.percentage}%`,
                  height: '100%',
                  backgroundColor: 'var(--secondary-400)',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease-in-out'
                }}
              />
            </div>
          </div>
        </div>

        {/* SEÇÃO 4: Controles de Visualização e Grid/Lista */}
        <div className="w-full">
          {/* Controles de Visualização */}
          <div className="flex justify-end w-full" style={{ 
            gap: 'var(--extra-small-padding)',
            marginBottom: 'var(--large-padding)'
          }}>
            <button 
              className="textless-medium"
              onClick={() => setViewMode('list')}
              style={{ 
                backgroundColor: viewMode === 'list' ? 'var(--secondary-100)' : 'var(--background)',
                transition: 'background-color 0.2s'
              }}
              aria-label="Visualização em lista"
            >
              <ListIcon size={24} style={{ color: 'var(--secondary-700)' }} />
            </button>
            <button 
              className="textless-medium"
              onClick={() => setViewMode('grid')}
              style={{ 
                backgroundColor: viewMode === 'grid' ? 'var(--secondary-100)' : 'var(--background)',
                transition: 'background-color 0.2s'
              }}
              aria-label="Visualização em grade"
            >
              <GridIcon size={24} style={{ color: 'var(--secondary-700)' }} />
            </button>
          </div>

          {/* Visualização Condicional */}
          {viewMode === 'grid' ? (
            /* Grid de Livros */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 w-full" style={{ gap: 'var(--small-padding)' }}>
              {readlist.books.map((book, index) => (
                <div 
                  key={book.id}
                  className="aspect-[2/3] cursor-pointer relative overflow-hidden"
                  style={{ 
                    backgroundColor: 'var(--secondary-500)',
                    borderRadius: 'var(--medium-border-radius)',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Livro ${index + 1}`}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Image 
                    src={book.cover}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="flex flex-col w-full" style={{ gap: 'var(--medium-padding)' }}>
              {readlist.books.map((book) => (
                <div 
                  key={book.id}
                  className="flex flex-col sm:flex-row gap-4 cursor-pointer"
                  style={{ 
                    padding: 'var(--small-padding)',
                    paddingLeft: '2px',
                    paddingTop: '12px',
                    borderRadius: '0px',
                    transition: 'background-color 0.2s',
                    borderBottom: '1px solid var(--secondary-600)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--neutral-100)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* Capa do Livro */}
                  <div 
                    className="relative overflow-hidden flex-shrink-0 mx-auto sm:mx-0"
                    style={{ 
                      width: '100px',
                      height: '120px',
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
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-b1 body-semibold" style={{ 
                      color: 'var(--secondary-800)',
                      marginBottom: '4px'
                    }}>
                      {book.title}
                    </h3>
                    <p className="text-b2" style={{ 
                      color: 'var(--secondary-700)',
                      marginBottom: '4px'
                    }}>
                      {book.year} • {book.pages}
                    </p>
                    {/* Estrelas de Avaliação */}
                    <div className="flex gap-1 justify-center sm:justify-start">
                      {Array(5).fill(null).map((_, i) => (
                        <StarIcon 
                          key={i}
                          size={24}
                          style={{ 
                            fill: i < book.rating ? 'var(--warning-500)' : 'none',
                            color: 'var(--warning-500)'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}