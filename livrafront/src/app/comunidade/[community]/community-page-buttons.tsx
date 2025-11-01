"use client";

import { useState } from "react";

import Button from "@/components/button";
import AddIcon from "@/components/icons/AddIcon";
import Edit2Icon from "@/components/icons/Edit2Icon";
import OpenBookIcon from "@/components/icons/OpenBookIcon";
import EditIcon from "@/components/icons/EditIcon";
import RemoveIcon from "@/components/icons/RemoveIcon";
import CheckIcon from "@/components/icons/CheckIcon";

interface CommunityPageButtonsProps {
    community: string;
    isMember: boolean; // Usuário é membro da comunidade
    isMod: boolean; // Usuário é moderador da comunidade
}

export default function CommunityPageButtons({ community, isMember, isMod }: CommunityPageButtonsProps) {
    
    const [leaveCommunity, setLeaveCommunity] = useState(false);

    const handleClick = () => {
        // Lógica para entrar/sair da comunidade
    }

    return (
        <div className="flex flex-row gap-1">
            {!isMember && <Button
                text="Entrar"
                icon={<AddIcon />}
                colorScheme="light-green"
                size="medium"
                onClick={handleClick}
            />}
            {isMember && <Button
                text="Sair"
                icon={<RemoveIcon />}
                colorScheme="light-brown"
                size="medium"
                onClick={handleClick}
            />}
            <Button
                text="Postar"
                icon={<Edit2Icon />}
                colorScheme="light-green"
                size="medium"
                path={`/${community}/postar` /* PROVISÓRIO */}
            />
            <Button
                text="Wiki"
                icon={<OpenBookIcon />}
                colorScheme="light-green"
                size="medium"
                path={"`/wiki/${community}`" /* PROVISÓRIO */}
            />
            {isMod && 
            <Button
                text="Editar"
                icon={<EditIcon />}
                colorScheme="dark-brown"
                size="medium"
                path={`/${community}/editar-comunidade` /* PROVISÓRIO */}
            />}
        </div>
    )
}