import { Readlist } from '../types/readlist';
import { useState } from 'react';
import EditIcon from './icons/EditIcon';
import InfoIcon from './icons/InfoIcon';
import Button from './button';

export function ReadlistCard({ r, userId }: { r: Readlist, userId: string }) {
  const isMine = r.criador?._id === userId;
  const favoritadoPorArray = Array.isArray(r.favoritadoPor) ? r.favoritadoPor : [];
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const [activeIcon, setActiveIcon] = useState<string | null>(null);

  function getIconColor(icon: string) {
    if (activeIcon === icon) return 'var(--primary-700)';
    if (hoveredIcon === icon) return 'var(--primary-400)';
    return 'var(--primary-300)';
  }

  function getHeartFill() {
    if (activeIcon === 'heart' || hoveredIcon === 'heart') return 'var(--primary-400)';
    return 'none';
  }

  function getShareFill() {
    if (activeIcon === 'share' || hoveredIcon === 'share') return 'var(--primary-400)';
    return 'none';
  }

  return (
    <div
      className="rounded-2xl shadow-md flex flex-row gap-6 items-center w-full max-w-[1200px] font-poppins mb-4 cursor-pointer transition-colors"
      style={{
        backgroundColor: 'var(--primary-200)', // cor original do card
        height: 220,
        fontFamily: 'var(--font-poppins)',
        padding: '32px 40px',
        position: 'relative',
        transition: 'background-color 0.2s',
        border: '2px solid var(--primary-300)', // borda verde mais clara
      }}
      tabIndex={0}
      role="button"
      onClick={() => window.location.href = `/readlist`}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          window.location.href = `/readlist`;
        }
      }}
    >
      {/* Editar para isMine, ícones para outros */}
      {isMine && (
        <div style={{ position: 'absolute', right: 24, top: 24, zIndex: 2 }}>
          <Button
            text="Editar"
            icon={<EditIcon />}
            size="small"
            colorScheme="dark-green" // cor marrom definida em button
            aria-label="Editar"
            onClick={e => {
              e.stopPropagation();
              window.location.href = `/readlist/editar/${r._id}`;
            }}
          />
        </div>
      )}
      {!isMine && (
        <div style={{ position: 'absolute', top: 24, right: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <button
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: 8 }}
            aria-label="Curtir"
            onMouseEnter={() => setHoveredIcon('heart')}
            onMouseLeave={() => setHoveredIcon(null)}
            onMouseDown={() => setActiveIcon('heart')}
            onMouseUp={() => setActiveIcon(null)}
          >
            <svg
              style={{ height: '32px', width: '32px', color: getIconColor('heart'), transition: 'color 0.2s' }}
              fill={getHeartFill()}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
          <button
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            aria-label="Compartilhar"
            onMouseEnter={() => setHoveredIcon('share')}
            onMouseLeave={() => setHoveredIcon(null)}
            onMouseDown={() => setActiveIcon('share')}
            onMouseUp={() => setActiveIcon(null)}
          >
            <svg
              style={{ height: '32px', width: '32px', color: getIconColor('share'), transition: 'color 0.2s' }}
              fill={getShareFill()}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>
        </div>
      )}
      {/* Imagem de capa */}
      <div className="flex items-center" style={{ height: '100%' }}>
        <img
          src={r.capa_url && r.capa_url.trim() !== '' ? r.capa_url : '/kemi-teste.jpg'}
          alt={r.nome}
          className="object-cover rounded-xl bg-gray-200"
          style={{ width: 120, height: 170, minWidth: 120, maxWidth: 120, marginRight: 32 }}
        />
      </div>
      {/* Conteúdo principal do card */}
      <div className="flex-1 flex flex-col justify-center relative">
  <h2 className="text-h4 font-bold mb-2 text-[var(--secondary-700)]" style={{ marginBottom: 8 }}>{r.nome}</h2>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-b2" style={{ color: 'var(--secondary-800)' }}>
            por <span style={{ fontWeight: 'bold' }}>{r.criador?.username ?? 'desconhecido'}</span>
          </span>
        </div>
        {/* Informações sobre a readlist */}
  <div className="text-b2 text-[var(--secondary-800)] mb-2">{r.descricao}</div>
        <div className="text-b2 my-1 text-[var(--secondary-700)]">
          {Array.isArray(r.livros) ? r.livros.length : 0} livros
        </div>
        <div className="flex gap-2 mt-2">
          {favoritadoPorArray.length > 0 && !isMine && <span className="px-3 py-1 bg-[var(--success-100)] text-[var(--success-700)] rounded text-b3 font-semibold">Favoritada</span>}
        </div>
        {/* InfoIcon + Privada/Pública no canto inferior direito */}
  <div style={{ position: 'absolute', right: 0, bottom: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <InfoIcon style={{ width: 22, height: 22, color: 'var(--secondary-700)' }} />
          <span className="text-b3 font-semibold" style={{ color: 'var(--secondary-700)' }}>
            {r.publica ? 'Pública' : 'Privada'}
          </span>
        </div>
      </div>
    </div>
  );
}
