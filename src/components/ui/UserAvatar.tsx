// components/entry/UserAvatar.tsx
"use client";
import Image from "next/image";

interface UserAvatarProps {
    avatar?: string;
    username: string;
    id: string;
    size?: 'sm' | 'md' | 'lg' | 'username';
    className?: string;
}

export const UserAvatar = ({ avatar, id, username, size = 'md', className = '' }: UserAvatarProps) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        username: 'w-40 h-40'
    };

    const sizeDimensions = {
        sm: { width: 32, height: 32 },
        md: { width: 40, height: 40 },
        lg: { width: 48, height: 48 },
        username: { width: 160, height: 160 }
    };

    const avatarClassName = `${sizeClasses[size]} rounded-full overflow-hidden bg-neutral-700 ${className}`;

    if (avatar) {
        return (
            <div className={avatarClassName}>
                <Image
                    src={`https://cdn.discordapp.com/avatars/${id}/${avatar}`}
                    alt={`${username}'s avatar`}
                    className="w-full h-full object-cover"
                    width={sizeDimensions[size].width}
                    height={sizeDimensions[size].height}
                    priority
                    unoptimized
                />
            </div>
        );
    }

    return (
        <div className={avatarClassName + ' flex items-center justify-center'}>
            <span className="text-neutral-400">
                {username.charAt(0).toUpperCase()}
            </span>
        </div>
    );
};
