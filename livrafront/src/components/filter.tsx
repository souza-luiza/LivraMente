"use client";

import { useEffect, useRef, useState } from "react";
import FilterIcon from "./icons/FilterIcon";
import Button from "./button";
import { AnimatePresence, motion } from "framer-motion";
import LoaderIcon from "./icons/LoaderIcon";

interface DropdownFilterProps {
  filters: string[];
  filterIcons?: React.ReactNode[];
  currentFilter: string;
  onChange: (filter: string) => void;
  size?: "small" | "medium" | "large";
  colorScheme?: "light-green" | "dark-green" | "light-brown" | "dark-brown" | "light-neutral";
}

export default function DropdownFilter({
    filters,
    filterIcons,
    currentFilter,
    onChange,
    size = "medium",
    colorScheme = "light-green",
}: DropdownFilterProps) {

    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (!containerRef.current) return;

            if (!containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative inline-block" ref={containerRef}>
            <Button
                text={currentFilter}
                icon={<FilterIcon />}
                size={size}
                colorScheme={colorScheme}
                onClick={() => setOpen(!open)}
            />

            <AnimatePresence mode="wait">
            {open && (
                <motion.div 
                    className="absolute left-0 mt-1 w-full medium-box small-border-width border-gray-300 shadow-md bg-white z-50"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                >
                {filters.map((filter, index) => (
                    <Button
                        key={index}
                        text={filter}
                        icon={filterIcons ? filterIcons[index] : <LoaderIcon />}
                        colorScheme={currentFilter === filter ? colorScheme : "light-neutral"}
                        size="small"
                        fullwidth={true}
                        onClick={() => {onChange(filter); setOpen(false);}}
                    />
                ))}
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
}