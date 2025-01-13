import React, { useState } from 'react';
import { X, Plus, CircleSlash, Badge, BadgeCheck, CrownIcon, HeartHandshake, Terminal } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from './Button';

interface BadgeManagementDialogProps {
    isOpen: boolean;
    onClose: () => void;
    username: string;
    currentBadges: string[];
    onAddBadge: (badge: string) => void;
    onRemoveBadge: (badge: string) => void;
}

export const BadgeManagementDialog: React.FC<BadgeManagementDialogProps> = ({
    isOpen,
    onClose,
    username,
    currentBadges,
    onAddBadge,
    onRemoveBadge
}) => {
    const [activeTab, setActiveTab] = useState('current');
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        badge: string | null;
    }>({
        isOpen: false,
        badge: null
    });

    const availableBadges = ['Owner', 'Admin', 'VIP', 'Developer'];
    const filteredAvailableBadges = availableBadges.filter(badge => !currentBadges.includes(badge));

    const badgeIcons: Record<string, React.ReactNode> = {
        Owner: <BadgeCheck size={20} className="text-blue-400" />,
        Admin: <HeartHandshake size={20} className="text-neutral-400" />,
        VIP: <CrownIcon size={20} className="text-emerald-400" />,
        Developer: <Terminal size={20} className="text-neutral-400" />
    };

    const handleRemoveBadge = (badge: string) => {
        setConfirmDialog({ isOpen: true, badge });
    };

    const confirmRemoveBadge = () => {
        if (confirmDialog.badge) {
            onRemoveBadge(confirmDialog.badge);
        }
        setConfirmDialog({ isOpen: false, badge: null });
    };

    return (
        <>
            <Dialog
                isOpen={isOpen}
                onClose={onClose}
                title={`Badges für ${username}`}
                className="w-[95vw] sm:w-[32rem] md:w-[36rem]"
            >
                <div className="w-full">
                    <div className="border-b border-neutral-700 -mt-4 mb-4">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab('current')}
                                className={`flex-1 px-2 sm:px-4 py-3 text-sm font-medium truncate transition-colors ${activeTab === 'current'
                                    ? 'text-white border-b-2 border-neutral-500'
                                    : 'text-neutral-400 hover:text-neutral-200'
                                    }`}
                            >
                                Aktuelle Badges
                            </button>
                            <button
                                onClick={() => setActiveTab('available')}
                                className={`flex-1 px-2 sm:px-4 py-3 text-sm font-medium truncate transition-colors ${activeTab === 'available'
                                    ? 'text-white border-b-2 border-neutral-500'
                                    : 'text-neutral-400 hover:text-neutral-200'
                                    }`}
                            >
                                Verfügbare Badges
                            </button>
                        </div>
                    </div>

                    {activeTab === 'current' && (
                        <div className="space-y-2 sm:space-y-3">
                            {currentBadges.length === 0 ? (
                                <div className="text-center py-6 sm:py-8 text-neutral-400">
                                    Keine Badges vorhanden
                                </div>
                            ) : (
                                currentBadges.map((badge) => (
                                    <div
                                        key={badge}
                                        className="flex items-center justify-between p-2 sm:p-3 bg-neutral-700/50 rounded-lg group hover:bg-neutral-700 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            {badgeIcons[badge] || <Badge size={20} className="text-neutral-400" />}
                                            <span className="text-neutral-200 text-sm sm:text-base">{badge}</span>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveBadge(badge)}
                                            className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-neutral-600 transition-all"
                                        >
                                            <X size={18} className="text-red-400" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'available' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            {filteredAvailableBadges.map((badge) => (
                                <button
                                    key={badge}
                                    onClick={() => onAddBadge(badge)}
                                    className="p-2 sm:p-3 bg-neutral-700/50 rounded-lg hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2 group"
                                >
                                    <Plus size={18} className="text-neutral-400 group-hover:text-neutral-400" />
                                    <span className="text-neutral-300 group-hover:text-neutral-100 text-sm sm:text-base">
                                        {badge}
                                    </span>
                                </button>
                            ))}
                            {filteredAvailableBadges.length === 0 && (
                                <div className="col-span-full text-center py-6 sm:py-8 text-neutral-400">
                                    Keine weiteren Badges verfügbar...
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Dialog>

            <Dialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ isOpen: false, badge: null })}
                title="Badge entfernen"
                className="w-[95vw] sm:w-[28rem]"
            >
                <div>
                    <p className="text-neutral-400 text-sm sm:text-base">
                        Möchtest du wirklich das Badge <strong>{confirmDialog.badge}</strong> von {username} entfernen?
                    </p>
                    <Button
                        onClick={confirmRemoveBadge}
                        variant="destructive"
                        className="w-full mt-4"
                        icon={X}
                        content='Ja. Entfernen'
                    />
                    <Button
                        onClick={() => setConfirmDialog({ isOpen: false, badge: null })}
                        className="w-full mt-4"
                        icon={CircleSlash}
                        content='Nein. Doch nicht'
                    />
                </div>
            </Dialog>
        </>
    );
};