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
        const iconProps = { size: 24, className: "text-lime-600" };
        
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
}