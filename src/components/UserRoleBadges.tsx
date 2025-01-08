/* eslint-disable @typescript-eslint/no-explicit-any */
import { BadgeCheck, Server, HeartHandshake } from "lucide-react";

// UserRoleBadges.tsx
interface UserRoleBadgesProps {
    roles: string[];
}

type Role = 'owner' | 'admin' | 'developer';

export const UserRoleBadges = ({ roles }: UserRoleBadgesProps) => {
    if (!roles?.length) return null;

    const badges: { [key in Role]: { icon: React.ForwardRefExoticComponent<any>; color: string; } } = {
        owner: {
            icon: BadgeCheck,
            color: 'text-blue-400',
        },
        admin: {
            icon: HeartHandshake,
            color: 'text-yellow-400',
        },
        developer: {
            icon: Server,
            color: 'text-white',
        }
    };

    return (
        <div className="flex items-center gap-1">
            {roles.filter((role): role is Role => ['owner', 'admin', 'developer'].includes(role)).map((role: Role) => {
                const badge = badges[role];
                if (!badge) return null;

                const Icon = badge.icon;

                return (
                    <div
                        key={role}
                        className="group relative"
                    >
                        <Icon className={`w-4 h-4 cursor-default ${badge.color}`} />
                    </div>
                );
            })}
        </div>
    );
};