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
            className={`flex items-center gap-4 bg-white rounded-lg border-2 border-b-lime-950 p-4 hover:shadow-lg transition-shadow ${
                !notificacao.lida ? 'light-green' : ''
            }`}
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
        </div>
    );
}