'use client';

import Comunidade from "@/components/comunidade-card";
import { Comunidade as ComunidadeType } from "@/types/comunidade";

interface ComunidadesProps { 
  genero?: string; // gênero a filtrar
  comunidades: ComunidadeType[];
}

export default function Comunidades({ genero, comunidades }: ComunidadesProps) {

    const filteredComunidades = genero ? comunidades.filter((c) => c.tags?.includes(genero)) : comunidades;

    return (
        <div className="w-full h-fit grid grid-cols-3">
            {filteredComunidades.map((comunidade) => (
                <Comunidade
                    key={comunidade._id}
                    id={comunidade._id}
                    nome={comunidade.nome}
                    descricao={comunidade.descricao}
                    image={comunidade.imagem_url}
                />
            ))}
        </div>
    )
}