import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Notificacao } from "@/types/notificacao";
import { formatarData } from "@/utils/formatarData";
import MoreHorizontalIcon from "./icons/MoreHorizontalIcon";
import InfoIcon from "./icons/InfoIcon";

interface NotificacaoItemProps {
    notificacao: Notificacao;
    onMarcarComoLida?: (id: string) => void;
    onRemover?: (id: string) => void;
}

export default function NotificacaoItem({ 
    notificacao, 
    onMarcarComoLida, 
    onRemover 
}: NotificacaoItemProps) {
    const [menuAberto, setMenuAberto] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    
    useEffect(() => {
        const handleClickFora = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuAberto(false);
            }
        };

        if (menuAberto) {
            document.addEventListener('mousedown', handleClickFora);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickFora);
        };
    }, [menuAberto]);

    const navegarParaConteudo = () => {
        switch (notificacao.tipo) {
            case 'novo_seguidor':
                if (notificacao.remetente?.username) {
                    router.push(`/${notificacao.remetente.username}`);
                }
                break;
            
            case 'entrar_comunidade':
            case 'promovido_moderador':
            case 'novo_post_comunidade':
                if (notificacao.comunidadeNome) {
                    router.push(`/comunidade/${notificacao.comunidadeNome}`);
                }
                break;

            case 'curtida_post':
            case 'comentario_post':
                if (notificacao.postId && notificacao.comunidadeNome) {
                    router.push(`/comunidade/${notificacao.comunidadeNome}/post/${notificacao.postId}`);
                }
                break;
        
            case 'moderacao_post':
                if (notificacao.postId && notificacao.comunidadeNome) {
                    router.push(`/comunidade/${notificacao.comunidadeNome}/post/${notificacao.postId}`);
                }
                break;
            default:
                break;
        }
    };

    const navegarParaPerfil = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        if (notificacao.remetente?.username) {
            router.push(`/${notificacao.remetente.username}`);
        }
    };

    return (
        <div 
            className={`flex items-center gap-4 bg-white rounded-lg border-2 p-4 hover:shadow-lg transition-shadow ${
                !notificacao.lida ? 'light-green' : ''
            }`}
            style={{ borderColor: 'var(--primary-800)' }}
        >
            {/* Foto do remetente (se houver) ou ícone */}
            <div className="flex-shrink-0">
                {notificacao.remetente ? (
                    <div 
                        className="w-12 h-12 rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition"
                        onClick={navegarParaPerfil}
                        title={`Ver perfil de @${notificacao.remetente.username}`}
                    >
                        {notificacao.remetente.foto_perfil ? (
                            <img 
                                src={notificacao.remetente.foto_perfil} 
                                alt={`@${notificacao.remetente.username}`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary-300 text-primary-800 font-semibold">
                                {notificacao.remetente.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary-300">
                        <InfoIcon size={30} style={{ color: 'var(--primary-800)' }} />
                    </div>
                )}
            </div>

            {/* Conteúdo à direita */}
            <div 
                className="flex-1 min-w-0 cursor-pointer"
                onClick={navegarParaConteudo}
            >
                {/* Mensagem */}
                <p 
                    className={`text-b1 ${!notificacao.lida ? 'font-semibold' : ''}`}
                >
                    {notificacao.mensagem}
                </p>
                
                {/* Timestamp */}
                <p className="text-b3 mt-1">
                    {formatarData(notificacao.criadaEm)}
                </p>
            </div>
            {/* Menu com opções: "marcar como lida" e "remover" */}
            <div className="relative flex-shrink-0" ref={menuRef}>
                <button
                    onClick={() => setMenuAberto(!menuAberto)}
                    className="p-2 text-neutral-400 transition hover:opacity-70"
                    aria-label="Opções"
                >
                    <MoreHorizontalIcon size={20} />
                </button>

                {menuAberto && (
                    <div 
                        className="absolute right-0 mt-2 w-40 bg-white shadow-lg border-2 rounded-lg z-10"
                        style={{ borderColor: 'var(--primary-800)' }}
                    >
                        {!notificacao.lida && onMarcarComoLida && (
                            <button
                                onClick={() => {
                                    onMarcarComoLida(notificacao.id);
                                    setMenuAberto(false);
                                }}
                                className="w-full text-left text-b3 text-secondary-800 transition flex items-center gap-2 p-3 hover:bg-primary-100"
                            >
                                Marcar como lida
                            </button>
                        )}
                        {onRemover && (
                            <button
                                onClick={() => {
                                    onRemover(notificacao.id);
                                    setMenuAberto(false);
                                }}
                                className="w-full text-left text-b3 text-error-500 transition flex items-center gap-2 p-3 hover:bg-error-100"
                            >
                                Remover
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}