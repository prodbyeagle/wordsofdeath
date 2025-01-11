/* eslint-disable @typescript-eslint/no-explicit-any */
import { BadgeCheck, HeartHandshake, Wrench } from "lucide-react";
import { Tooltip } from "./Tooltip";

interface UserRoleBadgesProps {
    roles: string[];
    tooltip?: boolean;
}

type Role = 'owner' | 'admin' | 'developer';

export const UserRoleBadges = ({ roles, tooltip = true }: UserRoleBadgesProps) => {
    if (!roles?.length) return null;

    const badges: { [key in Role]: { icon: React.ForwardRefExoticComponent<any>; color: string; } } = {
        owner: {
            icon: BadgeCheck,
            color: 'text-red-300',
        },
        admin: {
            icon: HeartHandshake,
            color: 'text-orange-300',
        },
        developer: {
            icon: Wrench,
            color: 'text-neutral-600',
        },
    };

    return (
        <div className="flex items-center gap-1">
            {roles.filter((role): role is Role => ['owner', 'admin', 'developer', 'moderator', 'contributor'].includes(role)).map((role: Role) => {
                const badge = badges[role];
                if (!badge) return null;

                const Icon = badge.icon;

                return (
                    tooltip ? (
                        <Tooltip key={role} content={role} position="top">
                            <div
                                key={role}
                                className="group relative"
                            >
                                <Icon className={`h-5 w-5 ${badge.color}`} />
                            </div>
                        </Tooltip>
                    ) : (
                        <div
                            key={role}
                            className="group relative"
                        >
                            <Icon className={`h-4 w-4 ${badge.color}`} />
                        </div>
                    )
                );
            })}
        </div>
    );
};
