"use client";

import { useState } from "react"; 
import { TabProvider, TabList, Tab, TabPanel } from "@/components/tabs";

import ProfilePosts from "@/components/profile-posts";
import PenToolIcon from "@/components/icons/PenToolIcon";
import Edit2Icon from "@/components/icons/Edit2Icon";

interface CommunityPostsProps {
    posts: any; // MUDAR PARA Post[]; ?
}

export default function CommunityPosts({ posts }: CommunityPostsProps) {
    const [value, setValue] = useState('community-feed');

    const handleChange = (newValue: string) => {
        setValue(newValue);
    };

    return (
        <TabProvider value={value} onChange={handleChange}>
            <TabList>
                <Tab label="Postagens" icon={<Edit2Icon />} size="small" value="community-feed" />
                <Tab label="Artes" icon={<PenToolIcon />} size="small" value="art" />
            </TabList>

            <TabPanel value="community-feed">
                {/*Postagens*/}
                <ProfilePosts username="stduser32" />
            </TabPanel>

            <TabPanel value="art">
                {/*Fanarts e Fanfics*/}
                <ProfilePosts username="artista2" />
            </TabPanel>
        </TabProvider>
    )
}