'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// Função para converter slug em título
function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function EditReadlistPage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;
  const readlistSlug = params.readlistSlug as string;
  
  // TODO: Implementar lógica real de verificação de autenticação e propriedade
  // Por enquanto, simulando verificação
  const currentUser = 'gatanoturna'; // TODO: Pegar do contexto/auth
  const isOwner = currentUser === username;

  useEffect(() => {
    // Redirecionar se não for o dono
    if (!isOwner) {
      router.push(`/${username}/readlist/${readlistSlug}`);
    }
  }, [isOwner, router, username, readlistSlug]);

  // Se não for o dono, não renderiza nada (vai redirecionar)
  if (!isOwner) {
    return null;
  }

  const readlistTitle = slugToTitle(readlistSlug);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-h1 mb-8">Editar Readlist</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-b1 mb-2">Nome da Readlist</label>
            <input 
              type="text" 
              defaultValue={readlistTitle}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-b1 mb-2">Descrição</label>
            <textarea 
              className="w-full p-3 border rounded-lg h-32"
              defaultValue="Descrição da readlist..."
            />
          </div>

          <div className="flex gap-4">
            <button 
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              onClick={() => {
                // TODO: Implementar salvamento
                router.push(`/${username}/readlist/${readlistSlug}`);
              }}
            >
              Salvar Alterações
            </button>
            
            <button 
              className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
              onClick={() => router.push(`/${username}/readlist/${readlistSlug}`)}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
