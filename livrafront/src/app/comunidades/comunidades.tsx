'use client';

import Comunidade from "@/components/comunidade-card";
import LoadingPage from "@/components/loading";
import { getComunidades } from "@/services/comunidades";
import { Comunidade as ComunidadeType } from "@/types/comunidade";
import { useEffect, useState } from "react";

interface ComunidadesProps { 
  genero?: string; // gênero a filtrar
} 

export default function Comunidades({ genero }: ComunidadesProps) {
    const [comunidades, setComunidades] = useState<ComunidadeType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchComunidades() {
        try {
            setLoading(true);
            const data = await getComunidades();
            setComunidades(data);
        } catch (err: any) {
            console.error("Erro ao buscar comunidades:", err);
            setError("Não foi possível carregar as comunidades.");
        } finally {
            setLoading(false);
        }
        }

        fetchComunidades();
    }, []);

  
    if (loading) return (
      <div className="fixed inset-0">
            <LoadingPage />
        </div>
    );
    
    if (error)
        return (
    <div className="flex flex-col items-center justify-center py-10">
        <h6 className="text-h6 text-[var(--error-500)] ">{error}</h6>
      </div>
    );

    const filteredComunidades = genero ? comunidades.filter((c) => c.tags?.includes(genero)) : comunidades;

    return (
        <div className="w-full h-fit grid grid-cols-3">
            {filteredComunidades.map((comunidade) => (
                <Comunidade
                    key={comunidade._id}
                    id={comunidade._id}
                    name={comunidade.nome}
                    descricao={comunidade.descricao}
                    image={comunidade.imagem_url}
                />
            ))}
        </div>
    )
}