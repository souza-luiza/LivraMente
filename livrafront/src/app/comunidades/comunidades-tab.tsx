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
import { getComunidades } from "@/services/comunidades";
import LoadingPage from "@/components/loading";
import ErrorIcon from "@/components/icons/ErrorIcon";
import Button from "@/components/button";
import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import HomeIcon from "@/components/icons/HomeIcon";

export default function ComunidadesTabs() {
    const [value, setValue] = useState('romance');
    const [comunidades, setComunidades] = useState<Comunidade[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (newValue: string) => {
        setValue(newValue);
    }

    useEffect(() => {
        async function fetchComunidades() {
            try {
                setLoading(true);
                const data = await getComunidades();
                setComunidades(data);
            } catch(err: any) {
                setError("Não foi possível carregar as comunidades.");
            } finally {
                setLoading(false);
            }
        }
        fetchComunidades();
    }, []);

    if (loading) return (
        <div className="fixed inset-0">
            <LoadingPage />
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center h-[70vh] justify-center">
            <div className="mb-4 flex justify-center"><ErrorIcon size={120} fill='var(--error-600)' aria-label="Logo" role='img'/></div>
            <h4 className="text-h4 text-[var(--error-600)] mb-6">{error}</h4>
            <Button text="Página Inicial" icon={<HomeIcon />} size="medium" colorScheme="dark-brown" path="/" />
        </div>
    );

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