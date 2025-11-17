import SearchIcon from "./icons/SearchIcon";
import { InputHTMLAttributes } from 'react';

export default function SearchBar({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <search className={`block w-full h-fit mt-2 ${className}`} role="search">
      <div className="relative w-[min(90%,600px)] mx-auto">
        <span className="absolute left-4 top-1/2 -translate-y-1/2">
          <SearchIcon size={20} fill="#5C8046" />
        </span>

        <input
          type="text"
          className="w-full pr-4 light-green placeholder:text-[#1F2A17] border-none focus:outline-none px-4 py-2 medium-border-radius text-b1"
          placeholder="Buscar livros, autores, gêneros..."
          style={{ paddingLeft: "3rem" }}
          {...props}
        />
      </div>
    </search>
  );
}