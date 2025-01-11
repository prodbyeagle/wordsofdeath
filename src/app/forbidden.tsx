'use client'

import React from 'react';
import { Lock, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const ForbiddenPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-900 p-4">
            <div className="w-full max-w-md">
                <article className="bg-neutral-800/50 mt-24 backdrop-blur-sm rounded-xl border border-neutral-700/50 overflow-hidden">
                    <div className="p-6">
                        <header className="flex flex-col items-center space-y-4 mb-6">
                            <div className="relative">
                                <div className="absolute -inset-1 bg-yellow-500/30 rounded-full blur-md" />
                                <Lock className="w-12 h-12 text-yellow-500 relative" />
                            </div>
                            <div className="text-center">
                                <h1 className="text-2xl font-semibold text-neutral-100 mb-2">
                                    Forbidden
                                </h1>
                                <p className="text-neutral-400 leading-relaxed">
                                    You do not have permission to access this page.
                                </p>
                            </div>
                        </header>

                        <div className="space-y-4">
                            <div className="bg-neutral-700/30 rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <ShieldOff className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-neutral-300">
                                            Forbidden Access
                                        </div>
                                        <div className="text-xs text-neutral-500">
                                            You are not allowed to view this page or resource.
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
                            >
                                Go Back
                            </Button>
                        </div>
                    </footer>
                </article>
            </div>
        </div>
    );
};

export default ForbiddenPage;
