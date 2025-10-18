import Link from "next/link";
import CodeIcon from "./icons/CodeIcon";
import Button from "./button";
import CommentIcon from "./icons/CommentIcon";
import LikeIcon from "./icons/LikeIcon";

export default function Post({ id, community, author, content, commentsCount, likesCount }: { 
    id?: string; 
    community?: string; 
    author?: string; 
    content?: string; 
    commentsCount?: number; 
    likesCount?: number 
}) {
    return (
        <Link href={`/${author}/posts/${id}`} className="block bg-white rounded-lg border-2 border-b-lime-950 p-4 hover:shadow-lg transition-shadow">
            <div className="flex gap-2 mb-2">
                <h6 className="text-h6">{community}</h6>
                <CodeIcon size={24} />
                <h6 className="text-h6">@{author}</h6>
            </div>
            <div className="mb-3">
                <p className="text-b2 whitespace-pre-line">{content}</p>
            </div>
            <div className="flex gap-2">
                <Button text={commentsCount} colorScheme="dark-green" size="small" icon={<CommentIcon />} />
                <Button text={likesCount} colorScheme="dark-green" size="small" icon={<LikeIcon />} />
            </div>
        </Link>
    )
}