import { useState, useEffect } from "react";

import Input from "./general-input";
import Button from "./button";
import RemoveIcon from "./icons/RemoveIcon";
import CheckIcon from "./icons/CheckIcon";
import { createReadlistSchema } from '@/lib/validations/create-readlist'
import { ZodError } from 'zod'

interface CreateReadlistProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { nome: string; descricao?: string; publica: boolean }, setError?: (msg:string)=>void) => void | Promise<void>;
  isLoading?: boolean;
  apiError?: string;
  clearApiError?: () => void;
}

export function CreateReadlist({ open, onClose, onCreate, isLoading, apiError, clearApiError }: CreateReadlistProps) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [publica, setPublica] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{nome?:string, descricao?:string}>({});
  // mostra erro da API
  useEffect(()=>{
    if(apiError){
      setError(apiError);
    }
  }, [apiError]);
  const [capa, setCapa] = useState<File | null>(null);
  const [capaPreview, setCapaPreview] = useState<string>("");

  useEffect(() => {
    if (capa) {
      const reader = new FileReader();
      reader.onloadend = () => setCapaPreview(reader.result as string);
      reader.readAsDataURL(capa);
    } else {
      setCapaPreview("");
    }
  }, [capa]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let localError = "";
    const setLocalError = (msg: string) => { localError = msg; setError(msg); };

    // Validação dos campos e exibição de erros
    try {
      createReadlistSchema.parse({ titulo: nome, descricao, publica });
      setFieldErrors({});
      setError('');
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const titleMsg = err.issues?.find(i => i.path?.[0] === 'titulo')?.message || 'Título inválido';
        setFieldErrors(prev => ({ ...prev, nome: titleMsg }));
        setError(titleMsg);
        return;
      }
    }

    if (onCreate.length >= 2) {
      await (onCreate as any)({ nome, descricao, publica }, setLocalError);
    } else {
      await onCreate({ nome, descricao, publica });
    }

    if (!localError && nome.trim()) {
      setNome("");
      setDescricao("");
      setPublica(true);
      setError("");
      setCapa(null);
      setCapaPreview("");
      onClose();
    }
  }

  // Atualização de  erros em tempo real
  function handleNomeChange(e: React.ChangeEvent<HTMLInputElement>){
    const v = e.target.value;
    setNome(v);
    try {
      createReadlistSchema.shape.titulo.parse(v);
      setFieldErrors(prev => ({...prev, nome: undefined}));
      setError('');
      if(typeof clearApiError === 'function') clearApiError();
    } catch(err:any){
      if (err instanceof ZodError) setFieldErrors(prev => ({...prev, nome: err.issues[0]?.message}));
    }
  }

  function handleDescricaoChange(e: React.ChangeEvent<HTMLInputElement>){
    const v = e.target.value;
    setDescricao(v);
    try{
      createReadlistSchema.shape.descricao.parse(v);
      setFieldErrors(prev => ({...prev, descricao: undefined}));
      if(typeof clearApiError === 'function') clearApiError();
    }catch(err:any){
      if (err instanceof ZodError) setFieldErrors(prev => ({...prev, descricao: err.issues[0]?.message}));
    }
  }

  return (
  <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
  <form className="bg-white rounded-lg p-8 shadow-lg min-w-[320px] max-w-[90vw] w-[600px] flex flex-col gap-4" onSubmit={handleSubmit}>
    <h2 className="text-h5 mb-2 text-center">Criar readlist</h2>
        {/* Upload de capa */}
        <div className="flex flex-col gap-2 items-start">
          <label className="text-b1 font-semibold">Capa da readlist</label>
          {capaPreview && <img src={capaPreview} alt="Preview capa" className="w-32 h-32 object-cover rounded-lg mb-2" />}
          <input 
            type="file" 
            accept="image/*" 
            id="capa-upload"
            title="Escolher imagem de capa"
            onChange={e => setCapa(e.target.files?.[0] || null)} 
          />
        {/* Informações básicas */}
        </div>
        <Input
          label={"Nome da readlist"}
          placeholder={"Nome da readlist"}
          value={nome}
          onChange={handleNomeChange}
          error={fieldErrors.nome || undefined}
          fullWidth
          inputSize="large"
        />
        {(fieldErrors.nome || error) && (
          <p role="alert" className="text-b3 text-red-600 mt-1">{fieldErrors.nome || (error ? '* Título é obrigatório' : '')}</p>
        )}
        <Input
          label="Descrição (opcional)"
          value={descricao}
          onChange={handleDescricaoChange}
          error={fieldErrors.descricao}
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
        {/* Confirmar/cancelar */}
        </div>
          <div className="flex gap-2 mt-4 justify-center">
            <Button type="button" text="Cancelar" icon={<RemoveIcon />} size="medium" colorScheme="light-brown" onClick={onClose} />
            <Button type="submit" text={isLoading?"Criando...":"Confirmar"} icon={<CheckIcon />} size="medium" colorScheme="light-green" disabled={!!isLoading} />
          </div>
      </form>
    </div>
  );
}
