import Link from "next/link";

interface GenreCardProps {
    label: string;
    href?: string;
    Icon?: React.ComponentType<{ size?: number; fill?: string; stroke?: string }>;
}

export default function GenreCard({ label, href = "#", Icon }: GenreCardProps) {
    return (
        <Link
            href={href}
            className="flex flex-col items-center justify-center dark-green rounded-xl hover:brightness-90 transition-all
                       w-full aspect-[6/4] p-6"
        >
            {Icon && <Icon size={60} fill="white" stroke="white" />}
            <span className="pt-4 text-h4 text-center">
                {label}
            </span>
        </Link>
    );
}