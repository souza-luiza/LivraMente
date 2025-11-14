import SearchIcon from "./icons/SearchIcon";
import { InputHTMLAttributes } from "react";

export default function SearchBar({ ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div 
      className="sticky top-0 z-40 w-full bg-[#FFFFFF]  py-2"
      style={{ borderBottomWidth: '1px', borderBottomColor: '#E0E0E0' }}
    >
      <search className="relative h-fit w-[min(90%,600px)] mx-auto block" role="search">
        <span className="absolute left-2 top-1/2 -translate-y-1/2">
          <SearchIcon size={20} fill="#5C8046" />
        </span>

        <input
          type="text"
          className="w-full pr-4 light-green placeholder:text-[#5C8046] border-none focus:outline-none medium-box text-b2 bg-[#E5EEDF]"
          placeholder="Buscar no Livra..."
          style={{ paddingLeft: "2rem" }}
          {...props}
        />
      </search>
    </div>
  );
}