"use client";
import Readlist from "@/components/readlist";
import { Readlist as ReadlistType } from '@/types/readlist';

interface ProfileReadlistsProps {
  readlists: ReadlistType[];
  username: string;
}

export default function ProfileReadlists({ readlists = [], username }: ProfileReadlistsProps) {
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