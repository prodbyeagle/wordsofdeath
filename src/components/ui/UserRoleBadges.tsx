/* eslint-disable @typescript-eslint/no-explicit-any */
import { BadgeCheck, CrownIcon, HeartHandshake, Wrench } from "lucide-react";
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

type Role = 'owner' | 'admin' | 'developer' | 'vip';

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
        vip: {
            icon: CrownIcon,
            color: 'text-purple-300',
        },
    };

    return (
        <div className="flex items-center gap-1">
            {roles.filter((role): role is Role => ['owner', 'admin', 'developer', 'vip'].includes(role)).map((role: Role) => {
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
