// Tipos de eventos já definidos no sistema
export type TipoNotificacao = 
    | 'curtida_post'           
    | 'curtida_comentario'    
    | 'curtida_resenha'      
    | 'comentario_post'       
    | 'comentario_resenha'     
    | 'resposta_comentario'   
    | 'mencao'               
    | 'novo_seguidor'    
    | 'favoritar_readlist'   
    | 'entrar_comunidade'      
    | 'moderacao_post'        
    | 'promovido_moderador';   

export type Notificacao = {
    id: string;
    tipo: TipoNotificacao;
    mensagem: string;
    lida: boolean;
    criadaEm: string;
    remetente?: {
        id: string;
        username: string;
        foto_perfil?: string;
    };
    postId?: string;
    comentarioId?: string;
    resenhaId?: string;
    readlistId?: string;
    comunidadeNome?: string;
};