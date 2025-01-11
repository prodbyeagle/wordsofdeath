import { Entry } from "@/types";
import { UserRoleBadges } from "../ui/UserRoleBadges";
import { TimeStamp } from "../ui/Timestamp";
import { UserAvatar } from "../ui/UserAvatar";
import { Tag, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";

interface EntryCardProps {
    entry: Entry;
    avatarUrl?: string;
    avatar?: string;
    userRoles: string[];
    tooltip?: boolean;
    isAdmin: boolean;
    onDelete: (id: string) => void;
}

export const EntryCard = ({ entry, avatar, userRoles = [], tooltip = true, isAdmin, onDelete }: EntryCardProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = () => {
        if (showDeleteConfirm) {
            onDelete(entry.id);
            setShowDeleteConfirm(false);
        } else {
            setShowDeleteConfirm(true);
        }
    };

    return (
        <span
            className="block group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setShowDeleteConfirm(false);
            }}
        >
            <article className="h-full bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 overflow-hidden hover:border-neutral-500/50 transition-all duration-300 relative">
                <div className="p-4">
                    <header className="flex items-center space-x-3 mb-3">
                        <UserAvatar avatar={avatar} id={entry.authorId} username={entry.author} />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1">
                                <span className="text-sm font-medium text-neutral-200 truncate">
                                    {entry.author}
                                </span>
                                <UserRoleBadges roles={userRoles} tooltip={tooltip} />
                            </div>
                            <TimeStamp timestamp={entry.timestamp} showIcon={true} />
                        </div>
                    </header>

                    <div className="relative">
                        <p className="text-neutral-100 leading-relaxed">
                            {entry.entry}
                        </p>
                        <div className="absolute inset-x-0 bottom-0 h-1" />
                    </div>
                </div>

                {entry.categories && entry.categories.length > 0 && (
                    <footer className="px-4 py-3 border-t border-neutral-700/50 bg-neutral-800/30">
                        <div className="flex items-center gap-2 text-sm overflow-x-auto scrollbar-none">
                            <Tag className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                            <div className="flex gap-2 flex-wrap">
                                {entry.categories.map((category, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 rounded-md bg-neutral-700/50 text-neutral-300"
                                    >
                                        {category}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </footer>
                )}

                <div className={`absolute top-2 right-2 transition-all duration-500 ${isAdmin ? (isHovered ? 'opacity-100 scale-110' : 'opacity-0') : 'hidden'}`}>
                    <Button
                        variant={showDeleteConfirm ? "destructive" : "destructive"}
                        size="sm"
                        onClick={handleDelete}
                    >
                        {showDeleteConfirm ? (
                            "Confirm Delete"
                        ) : (
                            <Trash2 className="h-4 w-4"/>
                        )}
                    </Button>
                </div>
            </article>
        </span>
    );
};