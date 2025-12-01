interface ProgressoLivrosProps {
    lidos: number;
    total: number;
}

export default function ProgressoLivros({
    lidos = 0,
    total = 1,
}: ProgressoLivrosProps) {

    const porcentagem = Math.round((lidos / total) * 100);

    return (
        <div className="bg-[#472B15] text-[#D2BCAA] p-3 medium-border-radius">
                <div className="flex justify-between pb-2">
                    <p className="text-b3">Lidos {lidos} de {total}</p>
                    <p className="text-b3">{porcentagem}%</p>
                </div>

                {/* Barra de progresso */}
                <div className="w-full h-2 bg-[#3A2312] large-border-radius">
                    <div className="h-full bg-[#D2BCAA] large-border-radius" style={{ width: `${porcentagem}%`, transition: 'width 0.3s ease-in-out'}}>
                    </div>
                </div>
        </div>
    );
}