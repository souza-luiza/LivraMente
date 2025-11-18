import { useState, useEffect, useRef } from "react";
import Input from "./general-input";
import Button from "./button";
import RemoveIcon from "./icons/RemoveIcon";
import CheckIcon from "./icons/CheckIcon";
import { createReadlistSchema } from '@/lib/validations/create-readlist';
import { ZodError } from 'zod';
import Image from 'next/image';
import { toast } from "react-toastify";
import ToastNotification from "./toast-notification";
import EditIcon from "./icons/EditIcon";
import ReadlistCropModal from "./ReadlistCropModal";

interface CreateReadlistProps {
  open: boolean;
  onClose: () => void;
  onCreate: (
    data: { nome: string; descricao?: string; publica: boolean },
    croppedImageBlob: Blob | null, // Adicionar o tipo para a imagem
    setError?: (msg: string) => void
  ) => void | Promise<void>;
  isLoading?: boolean;
  apiError?: string;
  clearApiError?: () => void;
}

export function CreateReadlist({
  open,
  onClose,
  onCreate,
  isLoading,
  apiError,
  clearApiError
}: CreateReadlistProps) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [publica, setPublica] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ nome?: string; descricao?: string }>({});

  const [capaPreview, setCapaPreview] = useState<string>("");
  const [croppedImageBlob, setCroppedImageBlob] = useState<Blob | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (apiError) {
      setError(apiError);
    }
  }, [apiError]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let localError = "";
    const setLocalError = (msg: string) => {
      localError = msg;
      setError(msg);
    };

    // Validação
    try {
      createReadlistSchema.parse({ titulo: nome, descricao, publica });
      setFieldErrors({});
      setError('');
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const titleMsg =
          err.issues?.find(i => i.path?.[0] === 'titulo')?.message || 'Título inválido';
        setFieldErrors(prev => ({ ...prev, nome: titleMsg }));
        setError(titleMsg);
        return;
      }
    }

    await (onCreate as (
      data: { nome: string; descricao?: string; publica: boolean },
      croppedImageBlob: Blob | null,
      setError: (msg: string) => void
    ) => Promise<void>)({ nome, descricao, publica }, croppedImageBlob, setLocalError);


    if (!localError && nome.trim()) {
      setNome("");
      setDescricao("");
      setPublica(true);
      setError("");
      setCapaPreview("");
      onClose();
    }
  }

  function handleNomeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setNome(v);
    try {
      createReadlistSchema.shape.titulo.parse(v);
      setFieldErrors(prev => ({ ...prev, nome: undefined }));
      setError('');
      if (typeof clearApiError === 'function') clearApiError();
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        setFieldErrors(prev => ({ ...prev, nome: err.issues[0]?.message }));
      }
    }
  }

  function handleDescricaoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setDescricao(v);
    try {
      createReadlistSchema.shape.descricao.parse(v);
      setFieldErrors(prev => ({ ...prev, descricao: undefined }));
      if (typeof clearApiError === 'function') clearApiError();
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        setFieldErrors(prev => ({ ...prev, descricao: err.issues[0]?.message }));
      }
    }
  }

  const handleImageClick = () => {
    // Resetando o valor do input para garantir que ele funcione novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCapaPreview(reader.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropSave = (croppedBlob: Blob) => {
    setCroppedImageBlob(croppedBlob);
    const previewUrl = URL.createObjectURL(croppedBlob);
    setCapaPreview(previewUrl);
    setShowCropModal(false);
    toast.info('Imagem pronta. Clique em "Confirmar" para salvar.');
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setCapaPreview("");
    // Resetar o input de arquivo para permitir selecionar a mesma imagem novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancel = () => {
    // Limpar preview e blob se houver
    if (croppedImageBlob) {
      URL.revokeObjectURL(capaPreview);
      setCroppedImageBlob(null);
    }
    
    // Resetar formulário para valores originais
    setNome(""); setDescricao(""); setPublica(true); setFieldErrors({}); setCapaPreview(""); setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
      <form
        className="bg-white rounded-lg p-8 shadow-lg min-w-[320px] max-w-[90vw] w-[600px] flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <h2 className="text-h5 mb-2 text-center">Criar readlist</h2>

        {/* Upload de capa */}
        <div className="flex flex-col gap-2">
          <label className="text-b1 font-semibold">Capa da readlist</label>
          <div className="relative">
            <Image
              className="object-cover rounded-lg mb-2 object-cover w-37 h-37"
              src={capaPreview || "/Readlist.svg"}
              width={150}
              height={150}
              alt="Capa da readlist"
              onError={(e) => { e.currentTarget.src = "/Readlist.svg"; }}
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
          <Button 
            icon={<EditIcon />} 
            colorScheme="dark-green" 
            size="small" 
            text='Alterar Foto' 
            onClick={handleImageClick}
            type="button"
          />
        </div>

        <Input
          label={"Nome da readlist"}
          placeholder={"Nome da readlist"}
          value={nome}
          onChange={handleNomeChange}
          error={undefined}
          className={(fieldErrors.nome || error) ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          fullWidth
          inputSize="large"
        />
        {(fieldErrors.nome || error) && (
          <p role="alert" className="text-b3 text-red-600 mt-1">{fieldErrors.nome || error}</p>
        )}

        <Input
          label="Descrição (opcional)"
          placeholder={"Descrição da readlist"}
          value={descricao}
          onChange={handleDescricaoChange}
          error={undefined}
          className={fieldErrors.descricao ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          fullWidth
          inputSize="large"
        />
        {fieldErrors.descricao && (
          <p role="alert" className="text-b3 text-red-600 mt-1">{fieldErrors.descricao}</p>
        )}

        {/* Visibilidade */}
        <div className="flex items-center gap-4 mt-2">
          <span className="text-b2 font-semibold">Visibilidade:</span>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="visibilidade"
              checked={publica}
              onChange={() => setPublica(true)}
            />
            <span>Pública</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="visibilidade"
              checked={!publica}
              onChange={() => setPublica(false)}
            />
            <span>Privada</span>
          </label>
        </div>

        {/* Botões */}
        <div className="flex gap-2 mt-4 justify-center">
          <Button
            type="button"
            text="Cancelar"
            icon={<RemoveIcon />}
            size="medium"
            colorScheme="light-brown"
            onClick={handleCancel}
          />
          <Button
            type="submit"
            text={isLoading ? "Criando..." : "Confirmar"}
            icon={<CheckIcon />}
            size="medium"
            colorScheme="light-green"
            disabled={!!isLoading}
          />
        </div>
      </form>
      <ReadlistCropModal
        isOpen={showCropModal}
        imageUrl={capaPreview}
        onClose={handleCropCancel}
        onSave={handleCropSave}
      />
      <ToastNotification />
    </div>
  );
}