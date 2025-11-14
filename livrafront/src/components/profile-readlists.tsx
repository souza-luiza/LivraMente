"use client";
import Readlist from "@/components/readlist";
import { Readlist as ReadlistType } from '@/types/readlist';

interface ProfileReadlistsProps {
  readlists: ReadlistType[];
  username: string;
}

export default function ProfileReadlists({ readlists, username }: ProfileReadlistsProps) {
  if (readlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-gray-500 text-b1">Nenhuma readlist encontrada</p>
      </div>
    );
  }

  return (
    <div className="w-full h-fit grid grid-cols-4 gap-2 relative">
      {readlists.map((readlist) => (
        <Readlist
          key={readlist._id}
          title={readlist.nome}
          author={username}
          link={`/${username}/readlist/${readlist.slug}`}
        />
      ))}
    </div>
  );
}