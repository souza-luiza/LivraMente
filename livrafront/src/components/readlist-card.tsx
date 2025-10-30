import { Readlist } from '../types/readlist';
import EditIcon from '@/components/icons/EditIcon';
import InfoIcon from '@/components/icons/InfoIcon';
import Button from '@/components/button';
import Image from 'next/image';

export function ReadlistCard({ r, userId }: { r: Readlist, userId: string }) {
  const isMine = r.criador?._id === userId;
  const favoritadoPorArray = Array.isArray(r.favoritadoPor) ? r.favoritadoPor : [];

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

      {/* Imagem de capa */}
      <div className="flex items-center" style={{ height: '100%' }}>
        <Image
          src={r.capa_url && r.capa_url.trim() !== '' ? r.capa_url : '/kemi-teste.jpg'}
          alt={r.nome}
          width={120}
          height={170}
          className="object-cover rounded-xl bg-gray-200"
          style={{ minWidth: 120, maxWidth: 120, marginRight: 32 }}
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
          <Button icon={<InfoIcon/>} text={r.publica ? 'Pública' : 'Privada'} />
        </div>
      </div>
    </div>
  );
}