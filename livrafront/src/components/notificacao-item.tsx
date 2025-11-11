import { useState, useRef, useEffect } from "react";
import HeartIcon from "./icons/HeartIcon";
import CommentIcon from "./icons/CommentIcon";
import MentionIcon from "./icons/MentionIcon";
import CheckIcon from "./icons/CheckIcon";
import UserCheckIcon from "./icons/UserCheckIcon";
import CommunityIcon from "./icons/CommunityIcon";
import StarIcon from "./icons/StarIcon";
import BlockIcon from "./icons/BlockIcon";
import TagIcon from "./icons/TagIcon";
import { Notificacao, TipoNotificacao } from "@/types/notificacao";
import InfoIcon from "./icons/InfoIcon";
import { formatarData } from "@/utils/formatarData";
import MoreHorizontalIcon from "./icons/MoreHorizontalIcon";

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
    
    const getIcone = (tipo: TipoNotificacao) => {
        const iconProps = { 
            size: 24, 
            style: { color: 'var(--primary-600)' } 
        };
        
        switch (tipo) {
            case 'curtida_post':
            case 'curtida_comentario':
            case 'curtida_resenha':
                return <HeartIcon {...iconProps} />;
            
            case 'comentario_post':
            case 'comentario_resenha':
            case 'resposta_comentario':
                return <CommentIcon {...iconProps} />;
            
            case 'mencao':
                return <MentionIcon {...iconProps} />;
            
            case 'novo_seguidor':
                return <UserCheckIcon {...iconProps} />;
            
            case 'favoritar_readlist':
                return <StarIcon {...iconProps} />;
            
            case 'entrar_comunidade':
                return <CommunityIcon {...iconProps} />;
            
            case 'moderacao_post':
                return notificacao.mensagem.toLowerCase().includes('aprovado') 
                    ? <CheckIcon {...iconProps} />
                    : <BlockIcon {...iconProps} />;
            
            case 'promovido_moderador':
                return <TagIcon {...iconProps} />;
            
            default:
                return <InfoIcon {...iconProps} />;
        }
    };
    return (
        <div 
            className={`flex items-center gap-4 bg-white rounded-lg border-2 p-4 hover:shadow-lg transition-shadow ${
                !notificacao.lida ? 'light-green' : ''
            }`}
            style={{ borderColor: 'var(--primary-800)' }}
        >
            {/* Ícone à esquerda */}
            <div className="flex-shrink-0">
                {getIcone(notificacao.tipo)}
            </div>

            {/* Conteúdo à direita */}
            <div className="flex-1 min-w-0">
                {/* Mensagem */}
                <p 
                    className={`text-b1 ${!notificacao.lida ? 'font-semibold' : ''}`}
                >
                    {notificacao.mensagem}
                </p>
                
                {/* Timestamp */}
                <p className="text-b3 text-neutral-400 mt-1">
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
                        className="absolute right-0 mt-2 w-48 bg-white shadow-lg border-2 rounded-lg z-10"
                        style={{ borderColor: 'var(--primary-800)' }}
                    >
                        {!notificacao.lida && onMarcarComoLida && (
                            <button
                                onClick={() => {
                                    onMarcarComoLida(notificacao.id);
                                    setMenuAberto(false);
                                }}
                                className="w-full text-left text-b2 text-secondary-800 transition flex items-center gap-2 p-4 hover:bg-primary-100"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Marcar como lida
                            </button>
                        )}
                        {onRemover && (
                            <button
                                onClick={() => {
                                    onRemover(notificacao.id);
                                    setMenuAberto(false);
                                }}
                                className="w-full text-left text-b2 text-error-500 transition flex items-center gap-2 p-4 hover:bg-error-100"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Remover
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}