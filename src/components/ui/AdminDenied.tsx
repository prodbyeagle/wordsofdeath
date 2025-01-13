'use client'

import React from 'react';
import { Shield, LockKeyhole, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * AdminDeniedPage component renders a page indicating that access is denied.
 * 
 * This component displays a message informing the user that they do not have
 * permission to access the page. It includes a styled message with an icon,
 * and a button to navigate back to the previous page.
 * 
 * @returns {React.JSX.Element} The rendered AdminDeniedPage component.
 */
export const AdminDeniedPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-900 p-4">
            <div className="w-full max-w-md">
                <article className="bg-neutral-800/50 mt-24 backdrop-blur-sm rounded-xl border border-neutral-700/50 overflow-hidden">
                    <div className="p-6">
                        <header className="flex flex-col items-center space-y-4 mb-6">
                            <div className="relative">
                                <div className="absolute -inset-1 bg-red-500/30 rounded-full blur-md" />
                                <Shield size={40} className="text-red-500 relative" />
                            </div>
                            <div className="text-center">
                                <h1 className="text-2xl font-semibold text-neutral-100 mb-2">
                                    Access Denied
                                </h1>
                                <p className="text-neutral-400 leading-relaxed">
                                    You don&apos;t have permission to access this page.
                                </p>
                            </div>
                        </header>

                        <div className="space-y-4">
                            <div className="bg-neutral-700/30 rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <LockKeyhole size={20} className="text-neutral-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-neutral-300">
                                            Admin Error
                                        </div>
                                        <div className="text-xs text-neutral-500">
                                            User is not an Admin
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="px-6 py-4 border-t border-neutral-700/50 bg-neutral-800/30">
                        <div className="flex justify-center">
                            <Button
                                className="px-4 py-2"
                                onClick={() => window.history.back()}
                                icon={Undo2}
                                content='Go Back'
                            >
                            </Button>
                        </div>
                    </footer>
                </article>
            </div>
        </div>
    );
};