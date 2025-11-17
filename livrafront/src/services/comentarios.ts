import { CreateCommentData, UpdateCommentData } from "@/types/comentario";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

function getAuthHeaders(): { [key: string]: string } | undefined {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export const commentsService = {
    async createComment(postId: string, data: CreateCommentData) {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comentarios`, {
            method: 'POST',
            headers: {
                ...(getAuthHeaders() || {}),
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error(`Erro ao criar comentário`);
        return response.json();
    },

    async likeComment(postId: string, commentId: string) {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comentarios/${commentId}/curtir`, {
            method: 'POST',
            headers: {
                ...(getAuthHeaders() || {})
            }
        });

        if (!response.ok) throw new Error(`Erro ao curtir/descurtir o comentário`);
        return response.json();
    },

    async deleteComment(postId: string, commentId: string) {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comentarios/${commentId}`, {
            method: 'DELETE',
            headers: {
                ...(getAuthHeaders() || {})
            }
        });

        if (!response.ok) throw new Error(`Erro ao excluir o comentário`);
        return response.json();
    },

    async updateComment(postId: string, commentId: string, data: UpdateCommentData) {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comentarios/${commentId}`, {
            method: 'PATCH',
            headers: {
                ...(getAuthHeaders() || {}),
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) throw new Error(`Erro ao atualizar comentário`);
        return response.json();
    }
}