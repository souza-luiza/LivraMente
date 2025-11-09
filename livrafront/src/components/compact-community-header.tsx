"use client";
import Image from "next/image";
import Button from "@/components/button";
import Edit2Icon from "@/components/icons/Edit2Icon";
import EditIcon from "@/components/icons/EditIcon";
import AddIcon from "@/components/icons/AddIcon";
import OpenBookIcon from "@/components/icons/OpenBookIcon";
import { Comunidade } from "@/types/comunidade";
import CommunityIcon from "./icons/CommunityIcon";

interface CompactHeaderProps {
  community: Comunidade
  isMember: boolean;
  isModerator: boolean;
  onToggleMembership: () => void;
  onOpenPostModal: () => void;
}

export default function CompactCommunityHeader({
  community,
  isMember,
  isModerator,
  onToggleMembership,
  onOpenPostModal
}: CompactHeaderProps) {
  return (
    <div className="fixed top-16 w-fit z-40 bg-gray-100 flex flex-row large-box gap-4">
        <button 
            className="flex flex-row gap-2 hover:cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, left: 0, behavior: "smooth" })}
        >
            <CommunityIcon size={40} />
            <h2 className="text-h4">
                {community.nome}
            </h2>
        </button>
        <div className="flex flex-row gap-1">
            {!isMember && (
            <Button
                text="Entrar"
                icon={<AddIcon />}
                colorScheme="dark-brown"
                size="medium"
                onClick={onToggleMembership}
            />
            )}
            {isMember && <Button
            text="Postar"
            icon={<Edit2Icon />}
            colorScheme="dark-brown"
            size="medium"
            onClick={onOpenPostModal}
            />}
            {isModerator && (
            <Button
                text="Editar"
                icon={<EditIcon />}
                colorScheme="dark-brown"
                size="medium"
                path={`/${community.nome}/editar-comunidade`}
            />
            )}
            <Button
            text="Wiki"
            icon={<OpenBookIcon />}
            colorScheme="dark-brown"
            size="medium"
            path={`/wiki/${community.nome}`}
            />
        </div>
    </div>
  );
}