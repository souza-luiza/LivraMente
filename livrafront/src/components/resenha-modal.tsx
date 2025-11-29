"use client";

import { motion, AnimatePresence } from "framer-motion";
import Rating from "@mui/material/Rating";
import Button from "@/components/button";
import CheckIcon from "./icons/CheckIcon";
import RemoveIcon from "./icons/RemoveIcon";
import ArrowLeftIcon from "./icons/ArrowLeftIcon";

export default function ResenhaModal({
  isOpen,
  onClose,
}: AvaliarResenhaModalProps) {
  if (!isOpen) return null;

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
          onClick={(e) => e.stopPropagation()}
        >
          {/* Título */}
          <h1 className="text-h5 mb-4">Avaliação e resenha do livro</h1>

          {/* Avaliação */}
          <div className="mb-6">
            <label
              className="block text-b2 mb-2"
              style={{ color: "var(--primary-800)" }}
            >
              Avaliação
            </label>

            <Rating name="avaliacao" precision={1} size="large" />
          </div>

          {/* Resenha */}
          <div className="mb-4 relative">
            <label
              htmlFor="resenha-textarea"
              className="absolute -top-2.5 left-2 px-1 text-b3"
              style={{
                color: "var(--primary-800)",
                background:
                  "linear-gradient(to bottom, var(--color-gray-50) 50%, var(--background) 50%)",
                opacity: 1,
              }}
            >
              Resenha (opcional)
            </label>

            <textarea
              id="resenha-textarea"
              className="w-full px-3 py-2 text-b2 rounded resize-none light-neutral medium-box transition-all duration-200 small-border-width border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-900 placeholder:text-gray-400 text-gray-900"
              style={{ minHeight: "120px" }}
              placeholder="Escreva sua opinião sobre o livro..."
            />
          </div>

          {/* Spoiler */}
          <div className="flex items-center mb-6" style={{ gap: 8 }}>
            <input
              id="spoiler-checkbox"
              type="checkbox"
              style={{ width: 16, height: 16 }}
            />
            <label
              htmlFor="spoiler-checkbox"
              className="text-b3 select-none"
              style={{ cursor: "pointer" }}
            >
              Inclui spoilers
            </label>
          </div>

          {/* Botões */}
          <div className="flex flex-row items-center gap-2 w-full mt-6">
            <div className="flex-1 flex justify-start">
              <Button
                text="Excluir"
                colorScheme="dark-brown"
                size="medium"
                icon={<RemoveIcon />}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                text="Voltar"
                colorScheme="light-brown"
                size="medium"
                icon={<ArrowLeftIcon />}
                onClick={onClose}
              />

              <Button
                text="Salvar"
                colorScheme="light-green"
                size="medium"
                icon={<CheckIcon />}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}