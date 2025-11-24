"use client";

import { useRouter } from "next/navigation";
import SearchIcon from "./icons/SearchIcon";
import { InputHTMLAttributes, useState, KeyboardEvent } from 'react';

export default function SearchBar({ className, defaultValue, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(defaultValue?.toString() || '');
  
  function handleSearch() {
    if (searchTerm.trim()) {
      router.push(`/busca?q=${encodeURIComponent(searchTerm)}`);
    }
  }

  function handleKeyPress(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  return (
    <div 
      className="sticky top-0 z-40 w-full bg-[#FFFFFF] py-2"
      style={{ borderBottomWidth: '1px', borderBottomColor: '#E0E0E0' }}
    >
      <search className="relative h-fit w-[min(90%,600px)] mx-auto block" role="search">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer" onClick={handleSearch}>
          <SearchIcon size={20} fill="#5C8046" />
        </span>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full pr-4 light-green placeholder:text-[#5C8046] border-none focus:outline-none medium-box text-b2 bg-[#E5EEDF]"
          placeholder="Buscar no Livra..."
          style={{ paddingLeft: "2rem" }}
          {...props}
        />
      </search>
    </div>
  );
}