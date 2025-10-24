'use client';

import HeartIcon from "@/components/icons/HeartIcon";
import { Tab, TabList, TabPanel, TabProvider } from "@/components/tabs";
import { useState } from "react";
import Comunidades from "./comunidades";

export default function ComunidadesTabs() {
    const [value, setValue] = useState('romance');

    const handleChange = (newValue: string) => {
        setValue(newValue);
    }

    return (
        <TabProvider value={value} onChange={handleChange}>
            <div className="bg-white rounded-lg shadow-sm mt-2">
                <TabList>
                    <Tab label="Romance" icon={<HeartIcon/>} value="romance" size="medium" />
                    <Tab label="Terror" icon={<HeartIcon/>} value="terror" size="medium" />
                    <Tab label="Fantasia" icon={<HeartIcon/>} value="fantasia" size="medium" />
                    <Tab label="Distopia" icon={<HeartIcon/>} value="distopia" size="medium" />
                </TabList>

                {/* Romance */}
                <TabPanel value="romance">
                    <Comunidades genero="romance" />
                </TabPanel>
                <TabPanel value="terror">
                    <Comunidades genero="terror" />
                </TabPanel>
                <TabPanel value="fantasia">
                    <Comunidades genero="fantasia" />
                </TabPanel>
                <TabPanel value="distopia">
                    <Comunidades genero="distopia" />
                </TabPanel>
            </div>
        </TabProvider>
    )
}