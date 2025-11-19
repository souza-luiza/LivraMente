'use client';

import { Tab, TabList, TabPanel, TabProvider } from "@/components/tabs";
import { useEffect, useState } from "react";
import Comunidades from "./comunidades";
import DramaIcon from "@/components/icons/DramaIcon";
import FantasyIcon from "@/components/icons/FantasyIcon";
import TerrorIcon from "@/components/icons/TerrorIcon";
import SuspenseIcon from "@/components/icons/SuspenseIcon";
import ComedyIcon from "@/components/icons/ComedyIcon";
import DystopiaIcon from "@/components/icons/DystopiaIcon";
import HeartIcon from "@/components/icons/HeartIcon";
import AdventureIcon from "@/components/icons/AdventureIcon";
import { Comunidade } from "@/types/comunidade";
import { communityService } from "@/services/comunidade";

export default function ComunidadesTabs() {
    const [value, setValue] = useState('romance');
    const [comunidades, setComunidades] = useState<Comunidade[]>([]);
    const [loading, setLoading] = useState(true);

    const handleChange = (newValue: string) => {
        setValue(newValue);
    }

    useEffect(() => {
        async function fetchComunidades() {
            try {
                setLoading(true);
                const data = await communityService.getComunidades();
                setComunidades(data);
            } catch(err: unknown) {
                setComunidades([]);
            } finally {
                setLoading(false);
            }
        }
        fetchComunidades();
    }, []);

    return (
        <TabProvider value={value} onChange={handleChange}>
            <div className="bg-white rounded-lg shadow-sm mt-2">
                <TabList>
                    <Tab label="Romance" icon={<HeartIcon fill="currentColor"/>} value="romance" size="medium" />
                    <Tab label="Aventura" icon={<AdventureIcon/>} value="aventura" size="medium" />
                    <Tab label="Fantasia" icon={<FantasyIcon/>} value="fantasia" size="medium" />
                    <Tab label="Drama" icon={<DramaIcon/>} value="drama" size="medium" />
                    <Tab label="Terror" icon={<TerrorIcon/>} value="terror" size="medium" />
                    <Tab label="Suspense" icon={<SuspenseIcon/>} value="suspense" size="medium" />
                    <Tab label="Comédia" icon={<ComedyIcon/>} value="comedia" size="medium" />
                    <Tab label="Distopia" icon={<DystopiaIcon/>} value="distopia" size="medium" />
                </TabList>

                {/* Romance */}
                <TabPanel value="romance">
                    <Comunidades genero="romance" comunidades={comunidades} />
                </TabPanel>
                <TabPanel value="aventura">
                    <Comunidades genero="aventura" comunidades={comunidades} />
                </TabPanel>
                <TabPanel value="fantasia">
                    <Comunidades genero="fantasia" comunidades={comunidades} />
                </TabPanel>
                <TabPanel value="drama">
                    <Comunidades genero="drama" comunidades={comunidades} />
                </TabPanel>
                <TabPanel value="terror">
                    <Comunidades genero="terror" comunidades={comunidades} />
                </TabPanel>
                <TabPanel value="suspense">
                    <Comunidades genero="suspense" comunidades={comunidades} />
                </TabPanel>
                <TabPanel value="comedia">
                    <Comunidades genero="comedia" comunidades={comunidades} />
                </TabPanel>
                <TabPanel value="distopia">
                    <Comunidades genero="distopia" comunidades={comunidades} />
                </TabPanel>
            </div>
        </TabProvider>
    )
}