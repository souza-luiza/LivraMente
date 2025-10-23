import SearchIcon from "./icons/SearchIcon";
import { InputHTMLAttributes } from 'react';

export default function SearchBar({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`relative w-full max-w-2xl ${className}`}>
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#5C8046]">
        <SearchIcon size={20} />
      </span>

      <input
        type="text"
        className="w-full pr-4 bg-[#CADDBF] text-[#1F2A17] border-none placeholder:text-[#5C8046] focus:outline-none focus:ring-[#95BB7E] medium-box text-b2" 
        style={{ paddingLeft: '2rem' }}
        {...props}
      />
    </div>
  );
}