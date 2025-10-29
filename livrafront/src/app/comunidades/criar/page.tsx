'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon';
import Input from '@/components/general-input';
import Button from '@/components/button';
import CheckIcon from '@/components/icons/CheckIcon';
import ShareIcon from '@/components/icons/ShareIcon';

export default function CreateReadlistPage() {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // falta enviar dados para o backend
  };
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-10 flex flex-col">
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
      </div>
    </div>
  );
}