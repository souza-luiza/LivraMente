'use client';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import Sidebar from '@/components/sidebar';
import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon';
import Input from '@/components/general-input';
import Button from '@/components/button';
import CheckIcon from '@/components/icons/CheckIcon';
import ShareIcon from '@/components/icons/ShareIcon';
import LoadingPage from '@/components/loading';

export default function CreateCommunityPage() {
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' | null }>({ text: '', type: null });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tags, setTags] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ nome?: string; descricao?: string; tags?: string; foto?: string }>({});

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => setNome(e.target.value);
  const handleDescricaoChange = (e: React.ChangeEvent<HTMLInputElement>) => setDescricao(e.target.value);
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => setTags(e.target.value);
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFoto(e.target.files[0]);
      setFotoPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Validação dos campos
  const validate = () => {
    const newErrors: typeof errors = {};
    if (!nome.trim()) newErrors.nome = 'O nome é obrigatório.';
    if (!descricao.trim()) newErrors.descricao = 'A descrição é obrigatória.';
    if (!tags.trim()) newErrors.tags = 'As tags são obrigatórias.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('nome', nome);
      formData.append('descricao', descricao);
      formData.append('tags', tags);
      if (foto) formData.append('foto', foto);
      const userId = localStorage.getItem('userId');
      if (userId) formData.append('moderadores', userId);

      const response = await fetch('http://localhost:3000/comunidades', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao criar comunidade');
      }
      setMessage({ text: 'Comunidade criada com sucesso!', type: 'success' });
      setIsLoading(false);
    } catch (err) {
      setMessage({ text: 'Erro ao criar comunidade', type: 'error' });
      setIsLoading(false);
    }
  };
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-10 flex flex-col">
        {message.text ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div
              className={`mb-6 text-center text-h3 font-primary ${
                message.type === 'error'
                  ? 'text-red-600'
                  : 'text-success-600'
              }`}
              role="alert"
            >
              {message.text}
            </div>
            <Button
              text="Voltar"
              icon={<ArrowLeftIcon />}
              size="large"
              colorScheme={message.type === 'error' ? 'light-green' : 'dark-green'}
              onClick={() => {
                setMessage({ text: '', type: null });
                router.push('/comunidades');
              }}
            />
          </div>
        ) : (
          <>
            <div className="flex items-center mb-6">
              <Button
                text="Voltar"
                icon={<ArrowLeftIcon />}
                size="medium"
                colorScheme="light-green"
                onClick={() => router.push('/communities')}
              />
              <div className="w-6" />
              <h1 className="text-h3">Crie sua nova comunidade</h1>
            </div>
            {/* Formulário de criação de comunidade */}
            <form className="mt-4" onSubmit={handleSubmit}>
              <div className="mb-4 flex flex-row items-start gap-40">
                {/* Informações básicas */}
                <div className="flex-1 max-w-2xl">
                  <div className="mb-4">
                    <label className="text-b1" htmlFor="nome-comunidade">Nome da comunidade</label>
                    <Input
                      id="nome-comunidade"
                      placeholder="Digite o nome da comunidade"
                      className="w-full"
                      value={nome}
                      onChange={handleNomeChange}
                    />
                    {errors.nome && <span className="text-red-500 text-xs">{errors.nome}</span>}
                  </div>
                  <div className="mb-4">
                    <label className="text-b1" htmlFor="descricao-comunidade">Descrição da comunidade</label>
                    <Input
                      id="descricao-comunidade"
                      placeholder="Digite a descrição da comunidade"
                      className="h-32 w-full"
                      value={descricao}
                      onChange={handleDescricaoChange}
                    />
                    {errors.descricao && <span className="text-red-500 text-xs">{errors.descricao}</span>}
                  </div>
                  <div className="mb-4">
                    <label className="text-b1" htmlFor="tags-comunidade">Tags da comunidade</label>
                    <Input
                      id="tags-comunidade"
                      placeholder="Digite as tags da comunidade"
                      className="w-full"
                      value={tags}
                      onChange={handleTagsChange}
                    />
                    <span className="text-xs text-gray-500">Separe as tags por vírgula. Ex: ficção, aventura, mistério</span>
                    {errors.tags && <span className="text-red-500 text-xs">{errors.tags}</span>}
                  </div>
                </div>
                {/* Upload de imagem de capa */}
                <div className="flex flex-col items-start">
                  <div className="w-40 h-40 bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-400 text-sm overflow-hidden">
                    {fotoPreview ? (
                      <img src={fotoPreview} alt="Prévia" className="w-full h-full object-cover" />
                    ) : (
                      'Prévia'
                    )}
                  </div>
                  <label htmlFor="upload-capa" className="text-b1 mb-2">Imagem de capa</label>
                  <input
                    id="upload-capa"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFotoChange}
                  />
                  <Button
                    type="button"
                    text="Upload de capa"
                    icon={<ShareIcon />}
                    size="small"
                    colorScheme="light-green"
                    onClick={() => {
                      const input = document.getElementById('upload-capa');
                      if (input) input.click();
                    }}
                  />
                </div>
              </div>
              <div className="mb-4 flex justify-center">
                <Button
                  text="Criar comunidade"
                  icon={<CheckIcon />}
                  size="large"
                  colorScheme="dark-green"
                />
              </div>
            </form>
            {isLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
                <LoadingPage />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}