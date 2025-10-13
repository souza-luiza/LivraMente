import { Readlist } from '../types/readlist';

export function ReadlistCard({ r }: { r: Readlist }) {
  return (
    <div className="light-green mb-6 mt-8 border border-gray-300 rounded-lg p-5 font-poppins">
      <div className="flex flex-row items-start gap-8">
        <img
          src={r.capa_url}
          alt={r.nome}
          className="w-[220px] min-w-[180px] max-w-[260px] h-[180px] object-cover rounded-lg bg-gray-200"
        />
        <div className="flex-1 flex flex-col justify-start">
          <h2 className="text-h5 my-3 mb-1">{r.nome}</h2>
          <div className="text-b2 text-gray-800 text-lg">
            Por <b>@{r.criador.username}</b>
          </div>
          <div className="text-b2 my-1 text-lg">
            {r.livros.length} livros • {r.curtidas ?? 0} curtidas
          </div>
          <div className="text-b3 text-gray-500 text-base">
            {r.publica ? 'Pública' : 'Privada'}
          </div>
          {r.descricao && (
            <div className="text-b3 text-gray-700 mt-2 text-base">{r.descricao}</div>
          )}
          <div className="text-b3 text-gray-400 mt-1 text-sm">
            Criada em {typeof r.createdAt === 'string'
              ? r.createdAt.slice(0, 10)
              : r.createdAt instanceof Date
                ? r.createdAt.toISOString().slice(0, 10)
                : ''}
          </div>
        </div>
      </div>
    </div>
  );
}
