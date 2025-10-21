import SearchIcon from "./icons/SearchIcon";
import { InputHTMLAttributes } from 'react';

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> { }

export default function SearchBar({ className, ...props }: SearchBarProps) {
  return (
    <div className={`relative w-full max-w-md ${className}`}>
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#95BB7E]">
        <SearchIcon size={20} />
      </span>

      <input
        type="text"
        className="w-full pr-4 bg-[#CADDBF] text-[#95BB7E] placeholder:text-[#95BB7E] rounded-lg focus:outline-none focus:ring-[#1F2A17] medium-box text-b3" 
        style={{ paddingLeft: '2rem' }}
        {...props}
      />
    </div>
  );
}