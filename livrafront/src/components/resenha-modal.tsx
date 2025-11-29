"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { resenhasService } from "@/services/resenhas";
import { motion, AnimatePresence } from "framer-motion";
import Rating from '@mui/material/Rating';
import Button from "@/components/button";
import CheckIcon from "./icons/CheckIcon";
import RemoveIcon from "./icons/RemoveIcon";
import ArrowLeftIcon from "./icons/ArrowLeftIcon";

interface ResenhaModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  resenhaId?: string; // se existir, é edição
  onSuccess?: () => void;
}

export default function ResenhaModal({ isOpen, onClose, bookId, resenhaId, onSuccess }: ResenhaModalProps) {
  const [avaliacao, setAvaliacao] = useState<number>(0);
  const [, setHover] = useState<number>(-1);
  const [resenha, setResenha] = useState("");
  const [isResenhaFocused, setIsResenhaFocused] = useState(false);
  const [spoiler, setSpoiler] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  // Carrega dados da resenha ao abrir para edição
  useEffect(() => {
    async function fetchResenha() {
      if (isOpen && resenhaId) {
        setLoading(true);
        try {
          const data = await resenhasService.getResenha(resenhaId);
          setAvaliacao(data.avaliacao ?? 0);
          setResenha(data.conteudo ?? "");
          setSpoiler(!!data.spoiler);
        } catch (e) {
          toast.error("Erro ao carregar resenha.");
        } finally {
          setLoading(false);
        }
      } else if (isOpen && !resenhaId) {
        // Caso não exista, criar nova resenha
        setAvaliacao(0);
        setResenha("");
        setSpoiler(false);
      }
    }
    fetchResenha();
  }, [isOpen, resenhaId]);

  if (!isOpen) return null;

  async function handleSalvar() {
    if (avaliacao < 1) {
      setError("Selecione uma avaliação.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (resenhaId) {
        await resenhasService.updateResenha(resenhaId, {
          conteudo: resenha,
          avaliacao,
          spoiler,
        });
      } else {
        await resenhasService.createResenha(bookId, {
          conteudo: resenha,
          avaliacao,
          spoiler,
        });
      }
      setAvaliacao(0);
      setResenha("");
      setSpoiler(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (e) {
      toast.error("Erro ao salvar resenha.");
    } finally {
      setLoading(false);
    }
  }

  async function handleExcluir() {
    if (!resenhaId) return;
    setLoading(true);
    setError(null);
    try {
      await resenhasService.removeResenha(resenhaId);
      if (onSuccess) onSuccess();
      onClose();
    } catch (e) {
      toast.error("Erro ao excluir resenha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
        onClick={onClose}
      >
        <div
          className="relative flex-shrink-0 bg-gray-50 medium-padding medium-border-radius"
          style={{
            color: "var(--primary-800)",
            maxHeight: "90vh",
            overflowY: "auto",
            minWidth: 440,
            maxWidth: 600,
            width: "100%",
            boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            padding: 40,
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Título */}
          <h1 className="text-h5 mb-4">Avaliação e resenha do livro</h1>

          {/* Avaliação */}
          <div className="mb-6">
            <label className="block text-b2 mb-2" style={{ color: "var(--primary-800)" }}>Avaliação</label>
            <Rating
              name="avaliacao"
              value={avaliacao}
              precision={1}
              size="large"
              onChange={(_, newValue) => setAvaliacao(newValue ?? 0)}
              onChangeActive={(_, newHover) => setHover(newHover)}
            />
          </div>

          {/* Resenha */}
          <div className="mb-4 relative">
            <label
              htmlFor="resenha-textarea"
              className={"absolute -top-2.5 left-2 px-1 text-b3 transition-opacity duration-200 pointer-events-none ${isResenhaFocused || resenha ? 'opacity-100' : 'opacity-0'}"}
              style={{
                color: "var(--primary-800)",
                background: "linear-gradient(to bottom, var(--color-gray-50) 50%, var(--background) 50%)",
              }}
            >
              Resenha (opcional)
            </label>
            <textarea
              id="resenha-textarea"
              value={resenha}
              onChange={e => setResenha(e.target.value)}
              onFocus={() => setIsResenhaFocused(true)}
              onBlur={() => setIsResenhaFocused(false)}
              className="w-full px-3 py-2 text-b2 rounded resize-none light-neutral medium-box transition-all duration-200 small-border-width border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-900 placeholder:text-gray-400 text-gray-900"
              style={{ minHeight: '120px' }}
              placeholder="Escreva sua opinião sobre o livro..."
            />
          </div>

          {/* Spoiler */}
          <div className="flex items-center mb-6" style={{ gap: 8 }}>
            <input
              id="spoiler-checkbox"
              type="checkbox"
              checked={spoiler}
              onChange={e => setSpoiler(e.target.checked)}
              style={{ width: 16, height: 16 }}
              disabled={resenha.trim().length === 0}
            />
            <label htmlFor="spoiler-checkbox" className="text-b3 select-none" style={{ cursor: resenha.trim().length === 0 ? 'not-allowed' : 'pointer', opacity: resenha.trim().length === 0 ? 0.6 : 1 }}>
              Inclui spoilers
            </label>
          </div>

          {/* Botões */}
          <div className="flex flex-row items-center gap-2 w-full mt-6">
            <div className="flex-1 flex justify-start">
              {resenhaId && (
                <Button
                  text="Excluir"
                  colorScheme="dark-brown"
                  size="medium"
                  onClick={handleExcluir}
                  icon={<RemoveIcon />}
                  disabled={loading}
                />
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                text="Voltar"
                colorScheme="light-brown"
                size="medium"
                onClick={onClose}
                icon={<ArrowLeftIcon />}
                disabled={loading}
              />
              <Button
                text={loading ? (resenhaId ? "Atualizando..." : "Salvando...") : (resenhaId ? "Atualizar" : "Salvar")}
                colorScheme="light-green"
                size="medium"
                icon={<CheckIcon />}
                disabled={avaliacao < 1 || loading}
                onClick={handleSalvar}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}