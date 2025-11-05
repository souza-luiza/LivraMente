import Link from "next/link";

interface CommunityMemberProps {
  username: string;
}

export default function communityMember({ username }: CommunityMemberProps) {
    return (
        <div className="w-fill flex flex-row items-center justify-between medium-box bg-[#E5EEDF]">
            <Link href={`/${username}`}>
                <div className="text-h6">
                    @{username}
                </div>
            </Link>
        </div>
    );
}