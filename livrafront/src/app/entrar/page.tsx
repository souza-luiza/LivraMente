"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/auth";
import React from 'react';
import Link from 'next/link';
import LogoIcon from '@/components/icons/LogoIcon';
import Button from '@/components/button';
import Input from '@/components/general-input';
import LoginIcon from '@/components/icons/LoginIcon';
import { motion } from 'framer-motion';
import { toast } from "react-toastify";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    let isValid = true;
    setErrors({ email: "", password: "" });

    if (!formData.email) {
      setErrors((prev) => ({ ...prev, email: "Email é obrigatório" }));
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors((prev) => ({ ...prev, email: "Email inválido" }));
    }

    if (!formData.password) {
      setErrors((prev) => ({ ...prev, password: "Senha é obrigatória" }));
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await loginUser({
        email: formData.email,
        password: formData.password
      });
      router.push(`/${response.username}`);
    } catch (error) {
      if(error instanceof Error && error.message === "Failed to fetch") 
        toast.error("Não foi possível conectar ao servidor.");
      else
        toast.error(error instanceof Error ? error.message : "Erro ao fazer login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="flex min-h-screen">
        {/* Left Side */} 
        <div className="flex-1 bg-[#B0CC9E]">
          <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.5, ease: "easeInOut" }} 
          className="flex flex-col items-center justify-center h-full text-[#1F2A17]"
          >
            <Link href="/">
              <LogoIcon size={160} fill="#1F2A17" className="mb-2" />
            </Link>
            <h1 className="text-h1">
              LivraMente
            </h1>
            <p className="text-b1 body-semibold">
              A rede dos leitores brasileiros
            </p>
          </motion.div>
        </div>

        {/* Right Side */}
        <div className="flex-1 bg-gray-50">
          <div className="flex flex-col items-center h-full justify-center p-8">
          <form onSubmit={handleSubmit} className="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg">

            <div className="mb-6 mt-4">
              <h2 className="text-b1 body-semibold text-center text-gray-900">
                Entre no Livra!
              </h2>
              <p className="text-b3 text-center text-gray-600 mt-1">
                Acesse sua conta
              </p>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Input 
                id="email"
                name="email"
                type="text"
                label="E-mail"
                placeholder="kemi@gata.miau"
                inputSize='medium'
                value={formData.email}
                onChange={handleChange}
                fullWidth
                error={errors.email}
              />

              {/* Password Input and Forgot Link */}
              <Input 
                id="password"
                name="password"
                type="password"
                label='Senha'
                placeholder="⁕⁕⁕⁕⁕⁕⁕⁕⁕"
                inputSize='medium'
                value={formData.password}
                onChange={handleChange}
                fullWidth
                error={errors.password}
              />
            </div>

            {/* Access Button */}
            <div className="mt-4 mb-4">
              <Button
                type='submit'
                disabled={isLoading}
                text='Entrar'
                icon={<LoginIcon />}
                size='medium'
                colorScheme='dark-green'
              />
            </div>

            <div className="flex flex-row items-baseline gap-1 mb-2">
              <Link href="" className="text-b3 body-semibold text-[#3D552F] hover:underline">
                Esqueci minha senha
              </Link>
            </div>
            {/* Sign-up Link */}
            <div className="flex flex-row items-baseline gap-1">
              <span className="text-b3 text-gray-900">
                Não tem uma conta?
              </span>
              <Link href="/cadastro" className="text-b3 body-semibold text-[#3D552F] hover:underline">
                Cadastre-se
              </Link>
            </div>
          </form>
          </div>
        </div>
      </div>
  );
}
