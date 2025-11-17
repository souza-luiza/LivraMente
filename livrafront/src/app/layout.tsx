import type { Metadata } from "next";
import type React from 'react';
import { ChatShell } from '@/components/chat-shell';

import { Geist, Geist_Mono, Poppins, Judson } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});

const judson = Judson({
  variable: "--font-judson",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Livramente",
  description: "Livramente, a rede social de leitores brasileiros",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${judson.variable} antialiased`}
      >
        <ChatShell>
          {children}
        </ChatShell>
      </body>
    </html>
  );
}
