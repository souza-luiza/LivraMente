'use client';

import { useState } from 'react';
import Image from 'next/image';
import Sidebar from '@/components/sidebar';

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
      <div className="sticky top-0 self-start" style={{ height: '100vh' }}>
        <Sidebar />
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-y-auto" style={{ padding: 'var(--large-padding)', maxWidth: '1500px', paddingLeft: '200px'}}>
        {/* SEÇÃO 1: Barra de Pesquisa */}
        <div style={{ marginBottom: 'var(--large-padding)' }}>
          <div 
            className="flex items-center gap-3"
            style={{ 
              backgroundColor: 'var(--primary-300)',
              borderRadius: '999px',
              padding: '12px var(--large-padding)'
            }}
          >
            <svg className="w-5 h-5" style={{ color: 'var(--primary-700)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
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
          className="light-green"
          style={{
            backgroundColor: 'var(--primary-200)',
            height: '320px',
            padding: 'calc(var(--large-padding) + 60px) var(--large-padding) calc(var(--large-padding) + 30px) var(--large-padding)',
            borderRadius: 'var(--large-border-radius)',
            marginBottom: 'var(--large-padding)',
            position: 'relative'
          }}
        >
          {/* Ícones de Ação */}
          <div className="flex flex-col" style={{ 
            position: 'absolute',
            top: '10px',
            right: '10px',
            gap: '0px'
          }}>
            <button 
              className="textless-medium"
              style={{ 
                backgroundColor: 'transparent',
                transition: 'all 0.3s ease'
              }}
              aria-label="Curtir"
              onClick={() => setIsLiked(!isLiked)}
              onMouseEnter={(e) => {
                if (!isLiked) {
                  const svg = e.currentTarget.querySelector('svg');
                  if (svg) {
                    svg.style.fill = 'var(--primary-400)';
                    svg.style.color = 'var(--primary-600)';
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (!isLiked) {
                  const svg = e.currentTarget.querySelector('svg');
                  if (svg) {
                    svg.style.fill = 'none';
                    svg.style.color = 'var(--primary-600)';
                  }
                }
              }}
            >
              <svg 
                className="icon-large" 
                style={{ 
                  height: '50px', 
                  width: '50px', 
                  color: 'var(--primary-600)', 
                  fill: isLiked ? 'var(--primary-600)' : 'none',
                  transition: 'all 0.3s ease' 
                }} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
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
              onMouseEnter={(e) => {
                if (!isShared) {
                  const svg = e.currentTarget.querySelector('svg');
                  if (svg) {
                    svg.style.fill = 'var(--primary-400)';
                    svg.style.color = 'var(--primary-600)';
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (!isShared) {
                  const svg = e.currentTarget.querySelector('svg');
                  if (svg) {
                    svg.style.fill = 'none';
                    svg.style.color = 'var(--primary-600)';
                  }
                }
              }}
            >
              <svg 
                className="icon-large" 
                style={{ 
                  height: '50px', 
                  width: '50px', 
                  color: 'var(--primary-600)', 
                  fill: isShared ? 'var(--primary-600)' : 'none',
                  transition: 'all 0.3s ease' 
                }} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>

          <div className="flex gap-6">
            {/* Imagem de Capa */}
            <div 
              className="relative overflow-hidden flex-shrink-0"
              style={{ 
                width: '250px',
                height: '230px',
                borderRadius: 'var(--large-border-radius)',
                marginTop: '-20px',    
                marginLeft: '0px',    
                marginBottom: '-30px' 
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
            <div className="flex-1">
              <div>
                <h1 className="text-h1" style={{ 
                  color: 'var(--secondary-700)',
                  marginBottom: 'var(--extra-small-padding)',
                  marginTop: '73px',
                  marginLeft: '15px'
                }}>
                  {readlist.title}
                </h1>
                <div className="flex items-center gap-2">
                  <div 
                    className="relative rounded-full overflow-hidden"
                    style={{ width: '55px', height: '55px', marginLeft: '15px' }}
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
        </div>

        {/* SEÇÃO 3: Container agrupado */}
        <div className="flex gap-6" style={{ alignItems: 'flex-start' }}>
          {/* Container principal */}
          <div 
            className="light-neutral flex-1"
            style={{ 
              borderRadius: 'var(--large-border-radius)',
              padding: '0px',
              position: 'relative'
            }}
          >
            {/* Descrição */}
            <div 
              style={{ 
                marginBottom: '0px',
                paddingBottom: 'var(--large-padding)',
                borderBottom: '1px solid var(--secondary-600)',
                maxWidth: '946px'
              }}
            >
              <p className="text-b2" style={{ color: 'var(--secondary-800)' }}>
                {readlist.description}
              </p>
            </div>

            {/* Indicador de Progresso - Position Absolute */}
            <div 
              className="light-brown"
              style={{ 
                backgroundColor: 'var(--secondary-200)',
                borderRadius: 'var(--large-border-radius)',
                padding: 'var(--medium-padding)',
                width: '300px',
                position: 'absolute',
                top: '0px',
                right: '0px'
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

          {/* Controles de Visualização */}
          <div className="flex justify-end" style={{ 
            gap: 'var(--extra-small-padding)',
            marginBottom: 'var(--large-padding)',
            marginTop: 'var(--large-padding)',
            width: '946px'
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
              <svg className="icon-medium" style={{ color: 'var(--secondary-700)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
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
              <svg className="icon-medium" style={{ color: 'var(--secondary-700)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>

          {/* Visualização Condicional */}
          {viewMode === 'grid' ? (
            /* Grid de Livros */
            <div className="grid grid-cols-6" style={{ gap: 'var(--small-padding)', maxWidth: '946px' }}>
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
            <div className="flex flex-col" style={{ gap: 'var(--medium-padding)', maxWidth: '946px' }}>
              {readlist.books.map((book) => (
                <div 
                  key={book.id}
                  className="flex gap-4 cursor-pointer"
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
                    className="relative overflow-hidden flex-shrink-0"
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
                  <div className="flex-1">
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
                    <div className="flex gap-1">
                      {Array(5).fill(null).map((_, i) => (
                        <svg 
                          key={i}
                          style={{ 
                            width: '24px', 
                            height: '24px',
                            fill: i < book.rating ? 'var(--warning-500)' : 'none',
                            stroke: 'var(--warning-500)'
                          }}
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
          {/* Fim do container principal */}

        </div>
        {/* Fim do container agrupado */}

      </div>
    </div>
  );
}