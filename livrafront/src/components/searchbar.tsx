import SearchIcon from "./icons/SearchIcon";
import { InputHTMLAttributes } from 'react';

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  inputSize?: 'small' | 'medium' | 'large'
}

export default function SearchBar({ className, inputSize = 'medium', ...props }: SearchBarProps) {
  const boxSize: Record<'small' | 'medium' | 'large', string> = {
    small:  "small-box",
    medium: "medium-box",
    large:  "large-box"
  };

  return (
    <div className={`relative w-full ${className}`}>
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#95BB7E]">
        <SearchIcon size={20} />
      </span>

      <input
        type="text"
        className={`w-full pl-12 pr-4 bg-[#B0CC9E] text-[#95BB7E] placeholder:text-[#95BB7E] rounded-lg focus:outline-none focus:ring-[#1F2A17] ${boxSize[inputSize]}`}
        {...props}
      />
    </div>
  );
}