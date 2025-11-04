// Interfaces TypeScript relacionadas a posts e suas operações.


/* Dados necessários para criar um novo post. */
export interface CreatePostData {
  conteudo: string;                                    
  comunidade: string;                                  
  imagens?: string[];                                 
  solicitacao_revisao?: boolean;                      
  categoria?: 'geral' | 'fanart' | 'fanfic';          
  tags?: string[];                                   
  livro_referenciado?: string;                        
  publico?: boolean;                                   
}


export interface Post {
  _id: string;                                         
  autor: {                                             
    _id: string;
    username: string;
    foto_perfil?: string;
  };
  conteudo: string;                                    
  comunidade: string | {                               
    _id: string;
    nome: string;
  };
  categoria: 'geral' | 'fanart' | 'fanfic';           
  status: 'publicado' | 'pendente_moderacao' | 'rejeitado'; 
  imagens: string[];                                   
  tags: string[];                                     
  curtidas: string[];                                  
  comentarios: any[];                                 
  publico: boolean;                                   
  data_criacao: string;                                
  data_atualizacao: string;                            
  livro_referenciado?: string;                         
  solicitacao_revisao: boolean;                        
}


export interface LikeResponse {
  message: string;                                    
  totalCurtidas: number;                              
  jaCurtiu: boolean;                                 
}


export type UpdatePostData = Partial<CreatePostData>;


export enum PostCategoria {
  GERAL = 'geral',
  FANART = 'fanart',
  FANFIC = 'fanfic',
}


export enum PostStatus {
  PUBLICADO = 'publicado',
  PENDENTE = 'pendente_moderacao',
  REJEITADO = 'rejeitado',
}
