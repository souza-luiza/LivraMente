'use client';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon';
import Input from '@/components/general-input';
import Button from '@/components/button';
import CheckIcon from '@/components/icons/CheckIcon';
import ShareIcon from '@/components/icons/ShareIcon';

export default function CreateReadlistPage() {
  const router = useRouter();
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
        <form className="mt-4">
          <div className="mb-4 flex flex-row items-start gap-40">
            {/* Informações básicas */}
            <div className="flex-1 max-w-2xl">
              <div className="mb-4">
                <label className="text-b1">Nome da comunidade</label>
                <Input placeholder="Digite o nome da comunidade" className="w-full" />
              </div>
              <div className="mb-4">
                <label className="text-b1">Descrição da comunidade</label>
                <Input placeholder="Digite a descrição da comunidade" className="h-32 w-full" />
              </div>
              <div className="mb-4">
                <label className="text-b1">Tags da comunidade</label>
                <Input placeholder="Digite as tags da comunidade" className="w-full" />
              </div>
            </div>
            {/* Upload de imagem de capa */}
            <div className="flex flex-col items-start">
                <div className="w-40 h-40 bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-400 text-sm">
                  Prévia
              </div>
              <label htmlFor="upload-capa" className="text-b1 mb-2">Imagem de capa</label>
                <input
                  id="upload-capa"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
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