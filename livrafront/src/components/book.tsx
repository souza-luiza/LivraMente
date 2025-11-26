import Image from "next/image";

interface BookCardProps {
    bookCoverUrl: string;
    bootkTitle: string;
    bookAuthor: string;
}

export default function BookCard({ bookCoverUrl, bootkTitle, bookAuthor }: BookCardProps) {

    return (
        <div className="w-full flex flex-row light-neutral medium-border-radius p-2 hover:cursor-pointer hover:shadow-md gap-2">
            <div className="relative min-w-[90px] h-[120px] overflow-hidden medium-border-radius">
                <Image
                    src={bookCoverUrl}
                    alt={`Capa do livro ${bootkTitle}`}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="w-3/4 flex flex-col p-2 gap-1">
                <h5 className="text-h6 overflow-hidden line-clamp-3" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{bootkTitle}</h5>
                <p className="text-b2 overflow-hidden body-quotation">{bookAuthor}</p>
            </div>
        </div>
    );
}