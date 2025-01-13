import { Entry } from "@/types";
import { UserRoleBadges } from "../ui/UserRoleBadges";
import { TimeStamp } from "../ui/Timestamp";
import { UserAvatar } from "../ui/UserAvatar";
import { Tag, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";

/**
 * Props for the EntryCard component.
 */
interface EntryCardProps {
    /**
     * The entry data to display in the card.
     */
    entry: Entry;

    /**
     * The URL of the user's avatar. Used to override the default avatar.
     */
    avatarUrl?: string;

    /**
     * The avatar hash string for the user. If provided, it will display the user's avatar.
     */
    avatar?: string;

    /**
     * The roles associated with the user, used to display role badges.
     */
    userRoles: string[];

    /**
     * Whether tooltips should be displayed for role badges. Default: `true`.
     */
    tooltip?: boolean;

    /**
     * Whether the current user has admin privileges.
     * Determines if the delete button is visible and functional.
     */
    isAdmin: boolean;

    /**
     * Callback function to handle the deletion of an entry.
     * @param id - The ID of the entry to delete.
     */
    onDelete: (id: string) => void;
}

/**
 * A card component for displaying an entry with author information, content, and optional categories.
 * Provides an admin option to delete the entry if `isAdmin` is `true`.
 *
 * @param entry The entry data to display.
 * @param avatarUrl Optional custom URL for the user's avatar.
 * @param avatar The avatar hash string for the user.
 * @param userRoles The roles of the user, displayed as badges.
 * @param tooltip Whether tooltips should be displayed for role badges. Default: `true`.
 * @param isAdmin Whether the current user is an admin, enabling the delete option.
 * @param onDelete Callback for handling entry deletion.
 * @returns A styled card displaying entry details and user information.
 */
export const EntryCard = ({ entry, avatar, userRoles = [], tooltip = true, isAdmin, onDelete }: EntryCardProps) => {
    const [isHovered, setIsHovered] = useState(false);

    /**
     * Handles the delete action for the entry.
     * Calls the `onDelete` function with the entry ID.
     */
    const handleDelete = () => {
        onDelete(entry.id);
    };

    return (
        <span
            className="block group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
            }}
        >
            <article className="h-full bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 overflow-hidden hover:border-neutral-500/50 transition-all duration-300 relative">
                <div className="p-4">
                    <header className="flex items-center space-x-3 mb-3">
                        <UserAvatar avatar={avatar} id={entry.authorId} username={entry.author} quality={64} />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1">
                                <span className="text-sm font-medium text-neutral-200 truncate">
                                    {entry.author}
                                </span>
                                <UserRoleBadges roles={userRoles} tooltip={tooltip} />
                            </div>
                            <TimeStamp timestamp={entry.timestamp} extended text="erstellt" live />
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
                            <Tag size={16} className="text-neutral-400 flex-shrink-0" />
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

                <div className={`absolute top-2 right-2 transition-all duration-200 ${isAdmin ? (isHovered ? 'opacity-100' : 'opacity-0') : 'hidden'}`}>
                    <Button
                        variant={"destructive"}
                        size="sm"
                        onClick={handleDelete}
                        icon={Trash2}
                        content="Remove"
                    >
                    </Button>
                </div>
            </article>
        </span>
    );
};
