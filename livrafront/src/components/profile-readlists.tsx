"use client";
import { useEffect, useState } from "react";
import Readlist from "@/components/readlist";

interface Readlist {
  _id: string;
  title: string;
  description?: string;
  slug: string;
  isPublic: boolean;
  createdAt: string;
  owner: {
    username: string;
  };
}

interface ProfileReadlistsProps {
  readlists: Readlist[];
  username: string;
}

export default function ProfileReadlists({ readlists, username }: ProfileReadlistsProps) {
  if (readlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-gray-500 text-b1">Nenhuma readlist pública encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {readlists.map((readlist) => (
        <Readlist
          key={readlist._id}
          title={readlist.title}
          author={readlist.owner?.username || username}
          link={`/${username}/readlist/${readlist.slug}`}
        />
      ))}
    </div>
  );
}