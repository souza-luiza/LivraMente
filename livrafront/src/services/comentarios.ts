import { CreateCommentData, UpdateCommentData } from "@/types/comentario";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

export const commentsService = {
    
    async createComment(postId: string, data: CreateCommentData) {
        const formData = new FormData();

        formData.append("conteudo", data.conteudo);

        if (data.imagens)
            data.imagens.forEach((file) => formData.append("imagens", file));

        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comentarios`, {
            method: 'POST',
            credentials: "include",
            body: formData,
        });

        if (!response.ok) throw new Error(`Erro ao criar comentário`);
        return response.json();
    },

    async likeComment(postId: string, commentId: string) {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comentarios/${commentId}/curtir`, {
            method: 'POST',
            credentials: "include",
        });

        if (!response.ok) throw new Error(`Erro ao curtir/descurtir o comentário`);
        return response.json();
    },

    async deleteComment(postId: string, commentId: string) {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comentarios/${commentId}`, {
            method: 'DELETE',
            credentials: "include",
        });

        if (!response.ok) throw new Error(`Erro ao excluir o comentário`);
        return response.json();
    },

    async updateComment(postId: string, commentId: string, data: UpdateCommentData) {
        console.log('PostID:', postId);
        console.log('CommentID: ', commentId);

        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comentarios/${commentId}`, {
            method: 'PATCH',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error(`Erro ao atualizar o comentário`);
        return response.json();
    }
}