import Link from "next/link";
import CodeIcon from "./icons/CodeIcon";
import Button from "./button";
import CommentIcon from "./icons/CommentIcon";
import HeartIcon from "./icons/HeartIcon";

export default function Post({ id, community, author, content, commentsCount, likesCount }: { 
    id?: string; 
    community?: string; 
    author?: string; 
    content?: string; 
    commentsCount?: number | any[]; 
    likesCount?: number | any[];
}) {

    const totalComments = Array.isArray(commentsCount)
        ? commentsCount.length
        : commentsCount ?? 0;

    const totalLikes = Array.isArray(likesCount)
        ? likesCount.length
        : likesCount ?? 0;

    return (
        <Link href={`/${author}/posts/${id}`} className="flex flex-col h-[220px] justify-between bg-white rounded-lg border-2 border-b-lime-950 p-4 hover:shadow-lg transition-shadow">
            <div className="flex gap-2 mb-2">
                <h6 className="text-h6">{community}</h6>
                <CodeIcon size={24} />
                <h6 className="text-h6">@{author}</h6>
            </div>
            <div className="mb-3 flex-1 overflow-hidden">
                <p className="text-b2 whitespace-pre-line line-clamp-4">{content}</p>
                <span className="text-b2 font-semibold hover:underline text-[var(--primary-700)]">Ver mais...</span>
            </div>
            <div className="flex gap-2">
                <Button text={String(totalComments)} colorScheme="dark-green" size="small" icon={<CommentIcon />} />
                <Button text={String(totalLikes)} colorScheme="dark-green" size="small" icon={<HeartIcon />} />
            </div>
        </Link>
    )
}