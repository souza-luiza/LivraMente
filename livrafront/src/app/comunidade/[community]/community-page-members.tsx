"use client";

import { useState } from "react";
import Button from "@/components/button";
import { TabProvider, TabList, Tab, TabPanel } from "@/components/tabs";

import CommunityIcon from "@/components/icons/CommunityIcon";
import CheckIcon from "@/components/icons/CheckIcon";

interface CommunityMembersProps {
    isMember: boolean; // Usuário é membro da comunidade
    isMod: boolean; // Usuário é moderador da comunidade
}

export default function CommunityMembers({ isMember, isMod }: CommunityMembersProps) {
    const [memberCount, setMemberCount] = useState(234); // Exemplo inicial de membros
    const [value, setValue] = useState('members');

    const handleChange = (newValue: string) => {
        setValue(newValue);
    };

    return (
        <TabProvider value={value} onChange={handleChange}>
            <TabList>
                <Tab label={`Membros (${memberCount})`} icon={<CommunityIcon />} size="small" value="members" />
                <Tab label="Moderadores" icon={<CheckIcon />} size="small" value="mods" />
            </TabList>

            <TabPanel value="members">
                <p className="text-b3">Lista de membros da comunidade será exibida aqui.</p>
            </TabPanel>

            <TabPanel value="mods">
                <p className="text-b3">Lista de moderadores da comunidade será exibida aqui.</p>
            </TabPanel>
        </TabProvider>
    )
}