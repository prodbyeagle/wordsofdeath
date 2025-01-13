/* eslint-disable @typescript-eslint/no-explicit-any */
import { BadgeCheck, CrownIcon, HeartHandshake, Puzzle } from "lucide-react";
import { Tooltip } from "./Tooltip";

interface UserRoleBadgesProps {
    /** 
     * An array of user roles that determines which badges to display.
     * Valid roles include 'owner', 'admin', 'developer' and 'vip'.
     */
    roles: string[];

    /** 
     * Whether to display a tooltip when hovering over the badge.
     * Default is true.
     */
    tooltip?: boolean;
}

type Role = 'Owner' | 'Admin' | 'VIP' | 'Developer';

/** 
 * A component that displays badges representing the roles of a user.
 * Each badge corresponds to a specific user role and can optionally show a tooltip with the role name.
 * 
 * @param {string[]} roles - A list of user roles to display badges for.
 * @param {boolean} [tooltip=true] - Whether to display a tooltip for each badge with the role name.
 * @returns {React.JSX.Element | null} A JSX element displaying the badges or null if no valid roles are provided.
 */
export const UserRoleBadges = ({ roles, tooltip = true }: UserRoleBadgesProps) => {
    if (!roles?.length) return null;

    const badges: { [key in Role]: { icon: React.ForwardRefExoticComponent<any>; color: string; } } = {
        Owner: {
            icon: BadgeCheck,
            color: 'text-blue-400',
        },
        Admin: {
            icon: HeartHandshake,
            color: 'text-zinc-600',
        },
        VIP: {
            icon: CrownIcon,
            color: 'text-emerald-400',
        },
        Developer: {
            icon: Puzzle,
            color: 'text-zinc-600',
        }
    };

    return (
        <div className="flex items-center gap-1">
            {roles.filter((role): role is Role => ['Owner', 'Admin', 'VIP', 'Developer'].includes(role)).map((role: Role) => {
                const badge = badges[role];
                if (!badge) return null;

                const Icon = badge.icon;

                return (
                    tooltip ? (
                        <Tooltip key={role} content={role} position="bottom" >
                            <div
                                key={role}
                                className="group relative"
                            >
                                <Icon size={16} className={`${badge.color}`} />
                            </div>
                        </Tooltip>
                    ) : (
                        <div
                            key={role}
                            className="group relative"
                        >
                            <Icon size={16} className={`${badge.color}`} />
                        </div>
                    )
                );
            })}
        </div>
    );
};
