// filepath: c:\Users\jpsza\OneDrive\Documentos\GitHub\Pessoal\es-unifesp-2025-2-grupo-alpha\livrafront\src\utils\cn.ts

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}