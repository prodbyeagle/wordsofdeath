import { Entry } from "@/types";
import Link from "next/link";
import { UserRoleBadges } from "../UserRoleBadges";
import { TimeStamp } from "../Timestamp";
import { UserAvatar } from "../Useravatar";
import { Tag } from "lucide-react";

interface EntryCardProps {
    entry: Entry;
    avatarUrl?: string;
    userRoles?: string[];
}

export const EntryCard = ({ entry, userRoles = [] }: EntryCardProps) => {
    return (
        <Link href={`/e/${entry.id}`} className="block group">
            <article className="h-full bg-zinc-800/50 backdrop-blur-sm rounded-xl border border-zinc-700/50 overflow-hidden hover:border-green-500/50 transition-all duration-300">
                <div className="p-4">
                    <header className="flex items-center space-x-3 mb-3">
                        <UserAvatar avatarUrl={entry.avatar} id={entry.authorId} username={entry.author} />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1">
                                <span className="text-sm font-medium text-zinc-200 truncate">
                                    @{entry.author}
                                </span>
                                <UserRoleBadges roles={userRoles} />
                            </div>
                            <TimeStamp timestamp={entry.timestamp} />
                        </div>
                    </header>

                    <div className="relative">
                        <p className="text-zinc-100 leading-relaxed">
                            {entry.entry}
                        </p>
                        <div className="absolute inset-x-0 bottom-0 h-1" />
                    </div>
                </div>

                {entry.categories && entry.categories.length > 0 && (
                    <footer className="px-4 py-3 border-t border-zinc-700/50 bg-zinc-800/30">
                        <div className="flex items-center gap-2 text-sm overflow-x-auto scrollbar-none">
                            <Tag className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                            <div className="flex gap-2 flex-wrap">
                                {entry.categories.map((category, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 rounded-md bg-zinc-700/50 text-zinc-300 cursor-default"
                                    >
                                        {category}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </footer>
                )}
            </article>
        </Link>
    );
};