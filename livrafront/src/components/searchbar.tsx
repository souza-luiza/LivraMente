import SearchIcon from "./icons/SearchIcon";
import { InputHTMLAttributes } from 'react';

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
}

export default function SearchBar({ className, ...props }: SearchBarProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#95BB7E]">
        <SearchIcon size={20} />
      </span>

      <input
        type="text"
        className="w-full py-3 pl-12 pr-4 bg-[#B0CC9E] text-[#95BB7E] placeholder:text-[#95BB7E] rounded-lg focus:outline-none focus:ring-[#1F2A17]"
        {...props}
      />
    </div>
  );
}