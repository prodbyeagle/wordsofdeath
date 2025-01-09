// components/entry/UserAvatar.tsx
"use client";
import Image from "next/image";

interface UserAvatarProps {
    avatarUrl?: string;
    username: string;
    id: string;
    size?: 'sm' | 'md' | 'lg';
}

export const UserAvatar = ({ avatarUrl, id, username, size = 'md' }: UserAvatarProps) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12'
    };

    const sizeDimensions = {
        sm: { width: 32, height: 32 },
        md: { width: 40, height: 40 },
        lg: { width: 48, height: 48 }
    };

    if (avatarUrl) {
        return (
            <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-neutral-700`}>
                <Image
                    src={`https://cdn.discordapp.com/avatars/${id}/${avatarUrl}.png`}
                    alt={`${username}'s avatar`}
                    className="w-full h-full object-cover"
                    width={sizeDimensions[size].width}
                    height={sizeDimensions[size].height}
                    priority
                />
            </div>
        );
    }

    return (
        <div className={`${sizeClasses[size]} rounded-full bg-neutral-700 flex items-center justify-center`}>
            <span className="text-neutral-400">
                {username.charAt(0).toUpperCase()}
            </span>
        </div>
    );
};