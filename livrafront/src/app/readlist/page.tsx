'use client';

import Image from 'next/image';
import Sidebar from '@/components/sidebar';

export default function ReadlistPage() {
  const readlist = {
    title: "Livros 2025",
    author: {
      username: "gatanoturna",
      avatar: "/kemi-teste.jpg"
    },
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    progress: {
      read: 20,
      total: 28,
      percentage: 71
    },
    coverImage: "/kemi-teste.jpg",
    books: Array(27).fill(null)
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--primary-200)' }}>
      {/* Sidebar Fixa - Preenche toda a altura */}
      <div className="sticky top-0 self-start" style={{ height: '100vh' }}>
        <Sidebar />
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-y-auto" style={{ padding: 'var(--large-padding)' }}>
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

        {/* SEÇÃO 2: Header da Readlist (Card Principal) */}
        <div 
          className="light-green"
          style={{ 
            borderRadius: 'var(--large-border-radius)',
            padding: 'var(--large-padding)',
            marginBottom: 'var(--large-padding)'
          }}
        >
          <div className="flex gap-6">
            {/* Imagem de Capa */}
            <div 
              className="relative overflow-hidden flex-shrink-0"
              style={{ 
                width: '160px',
                height: '224px',
                borderRadius: 'var(--medium-border-radius)'
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
              <div className="flex justify-between items-start" style={{ marginBottom: 'var(--medium-padding)' }}>
                <div>
                  <h1 className="text-h4" style={{ 
                    color: 'var(--primary-800)',
                    marginBottom: 'var(--extra-small-padding)' 
                  }}>
                    {readlist.title}
                  </h1>
                  <div className="flex items-center gap-2">
                    <div 
                      className="relative rounded-full overflow-hidden"
                      style={{ width: '32px', height: '32px' }}
                    >
                      <Image 
                        src={readlist.author.avatar}
                        alt={readlist.author.username}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-b2 body-semibold" style={{ color: 'var(--primary-800)' }}>
                      {readlist.author.username}
                    </span>
                  </div>
                </div>

                {/* Ícones de Ação */}
                <div className="flex flex-col" style={{ gap: 'var(--extra-small-padding)' }}>
                  <button 
                    className="textless-medium"
                    style={{ 
                      backgroundColor: 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                    aria-label="Curtir"
                  >
                    <svg className="icon-medium" style={{ color: 'var(--primary-800)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button 
                    className="textless-medium"
                    style={{ 
                      backgroundColor: 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                    aria-label="Compartilhar"
                  >
                    <svg className="icon-medium" style={{ color: 'var(--primary-800)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Indicador de Progresso */}
            <div 
              className="light-neutral flex flex-col items-center justify-center"
              style={{ 
                borderRadius: 'var(--large-border-radius)',
                padding: 'var(--medium-padding)',
                minWidth: '140px',
                alignSelf: 'flex-start'
              }}
            >
              <p className="text-b3" style={{ 
                color: 'var(--neutral-500)',
                marginBottom: '4px'
              }}>
                Você já leu
              </p>
              <p className="text-b3" style={{ 
                color: 'var(--neutral-500)',
                marginBottom: 'var(--extra-small-padding)'
              }}>
                {readlist.progress.read} de {readlist.progress.total}
              </p>
              <p className="text-h4" style={{ color: 'var(--neutral-800)' }}>
                {readlist.progress.percentage}%
              </p>
            </div>
          </div>

          {/* Descrição */}
          <div 
            style={{ 
              marginTop: 'var(--large-padding)',
              paddingTop: 'var(--large-padding)',
              borderTop: '1px solid var(--primary-400)'
            }}
          >
            <p className="text-b2" style={{ color: 'var(--primary-800)' }}>
              {readlist.description}
            </p>
          </div>
        </div>

        {/* SEÇÃO 3: Grid de Livros */}
        <div 
          className="light-green"
          style={{ 
            borderRadius: 'var(--large-border-radius)',
            padding: 'var(--large-padding)'
          }}
        >
          {/* Controles de Visualização */}
          <div className="flex justify-end" style={{ 
            gap: 'var(--extra-small-padding)',
            marginBottom: 'var(--large-padding)'
          }}>
            <button 
              className="textless-medium light-neutral"
              style={{ 
                transition: 'background-color 0.2s'
              }}
              aria-label="Visualização em lista"
            >
              <svg className="icon-medium" style={{ color: 'var(--neutral-800)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button 
              className="textless-medium light-neutral"
              style={{ 
                transition: 'background-color 0.2s'
              }}
              aria-label="Visualização em grade"
            >
              <svg className="icon-medium" style={{ color: 'var(--neutral-800)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>

          {/* Grid de Livros */}
          <div className="grid grid-cols-9" style={{ gap: 'var(--small-padding)' }}>
            {readlist.books.map((_, index) => (
              <div 
                key={index}
                className="aspect-[2/3] cursor-pointer"
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
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}