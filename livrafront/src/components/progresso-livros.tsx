import OpenBookIcon from "./icons/OpenBookIcon";

interface ProgressoLivrosProps extends React.SVGProps<SVGSVGElement> {
    lidos: number;
    total: number;
    largura?: number; // largura da barra
    altura?: number; // altura da barra
}

export default function ProgressoLivros({
    lidos = 0,
    total = 1,
    largura = 140,
    altura = 12,
    ...props
}: ProgressoLivrosProps) {

    const porcentagem = Math.round((lidos / total) * 100);

    // Garantir que porcentagem fique entre 0 e 100
    const clamped = Math.max(0, Math.min(100, porcentagem));

    const dashArray = largura;
    const dashOffset = dashArray - (clamped / 100) * dashArray;

    return (
        <div className="flex flex-col bg-[#472B15] text-[#D2BCAA] p-2 medium-border-radius">
            <div className="flex flex-row items-center gap-3">
                <OpenBookIcon size={30}/>
                <div className="flex-1 flex-col">
                    <div className="flex justify-between">
                        <p className="text-b3">Lidos {lidos} de {total}</p>
                        <p className="text-b3">{porcentagem}%</p>
                    </div>
                    <svg width={largura} height={altura} {...props}>
                        {/* Barra de fundo */}
                        <line
                            x1={0}
                            y1={altura / 2}
                            x2={largura}
                            y2={altura / 2}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="6"
                            opacity="0.2"
                            strokeLinecap="round"
                        />

                        {/* Barra de progresso */}
                        <line
                            x1={0}
                            y1={altura / 2}
                            x2={largura}
                            y2={altura / 2}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={dashArray}
                            strokeDashoffset={dashOffset}
                            style={{ transition: "stroke-dashoffset 0.3s ease" }}
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
}