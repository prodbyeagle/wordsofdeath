/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import { Entry, User } from "@/types";
import type { Metadata, ResolvingMetadata } from "next";
import { UserRoleBadges } from "@/components/ui/UserRoleBadges";
import { TimeStamp } from "@/components/ui/Timestamp";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/Button";

interface EntryProps {
    params: Promise<{ id: string }>;
}

const API_BASE_URL = "https://wordsofdeath-backend.vercel.app/api";

const fetcher = async <T,>(
    endpoint: string,
    token?: string
): Promise<T | null> => {
    try {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        return res.ok ? res.json() : null;
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return null;
    }
};

export async function generateMetadata(
    { params }: EntryProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;

    const entry = await fetcher<Entry>(`/entries/metadata/${id}`);
    if (!entry) {
        return {
            title: "Entry Not Found - Words of Death",
            description: "The entry you are looking for could not be found.",
        };
    }

    const user = entry.authorId
        ? await fetcher<User>(`/user/i/${entry.authorId}`)
        : null;

    const parentMeta = await parent;

    return {
        title: `${entry.entry}`,
        description: `Entry von ${entry?.author || "Unbekannt"}: ${entry.entry}`,
        openGraph: {
            title: `${entry.entry}`,
            description: `Entry von ${entry?.author || "Unbekannt"}: ${entry.entry}`,
            images: [
                user?.avatar
                    ? `https://cdn.discordapp.com/avatars/${entry.authorId}/${entry.avatar}`
                    : "/default-avatar.png",
                ...(parentMeta.openGraph?.images || []),
            ],
        },
    };
}

const EntryPage = async ({ params }: EntryProps) => {
    const { id } = await params;
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get("wordsofdeath")?.value;

    const [entry, allEntries] = await Promise.all([
        fetcher<Entry>(`/entries/${id}`, token),
        fetcher<Entry[]>(`/entries`, token),
    ]);

    if (!entry) {
        return (
            <div className="min-h-screen bg-neutral-900 text-neutral-200 flex items-center justify-center">
                <div className="max-w-lg w-full text-center">
                    <h1 className="text-3xl font-bold mb-6">Eintrag nicht gefunden</h1>
                    <p className="text-neutral-400 mb-4">
                        Der gewünschte Eintrag konnte nicht geladen werden. Bitte versuchen Sie es später erneut.
                    </p>
                    <Link href="/" passHref>
                        <Button variant="primary" className="px-6 py-2">
                            Zurück zur Startseite
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const user = entry.authorId
        ? await fetcher<User>(`/user/i/${entry.authorId}`, token)
        : null;

    const relevantEntries = allEntries
        ?.filter(
            (other) =>
                other.id !== entry.id &&
                other.categories.some((cat) => entry.categories.includes(cat))
        )
        .slice(0, 3);

    return (
        <div className="min-h-screen bg-neutral-900 text-neutral-100 cursor-default flex items-center justify-center py-12 px-6">
            <div className="max-w-3xl w-fit p-6 rounded-xl shadow-2xl bg-neutral-800">
                <h2 className="text-3xl font-bold mb-4 break-words">{entry.entry}</h2>
                <div className="text-sm text-neutral-400 text-center mb-6 items-center space-x-1">
                    <TimeStamp timestamp={entry.timestamp} />
                </div>

                {entry.categories.length > 0 && (
                    <div className="mt-1">
                        <h3 className="text-xl font-semibold mb-3 text-neutral-200">Kategorien</h3>
                        <div className="flex flex-wrap gap-2">
                            {entry.categories.map((category, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-neutral-700 border-2 border-neutral-700 text-neutral-200 rounded text-sm">
                                    {category}
                                </span>
                            ))}
                        </div>
                    </div>
                )}


                {user && (
                    <Link href={`/u/${user.username}`}>
                        <div
                            className="p-2 mt-8 w-full flex items-center space-x-2 rounded-xl bg-neutral-800 hover:bg-neutral-600 border-2 border-neutral-800 transition-all transform hover:rounded-xl">
                            <UserAvatar avatar={user.avatar} id={user.id} username={user.username} />
                            <span className="text-lg font-medium">von @{user.username}</span>
                            {user.roles && <UserRoleBadges roles={user.roles} />}
                        </div>
                    </Link>
                )}

                {relevantEntries && relevantEntries.length > 0 && (
                    <div className="mt-12">
                        <h3 className="text-xl font-semibold mb-3 text-neutral-200">Verwandte Einträge</h3>
                        <div className="flex flex-col space-y-4">
                            {relevantEntries.map((relevantEntry) => (
                                <Link key={relevantEntry.id} href={`/e/${relevantEntry.id}`} passHref>
                                    <span
                                        className="block p-4 rounded-xl bg-neutral-700 border border-neutral-800 transition-all transform hover:scale-[1.02] hover:bg-neutral-600">
                                        <div>
                                            <span
                                                className="text-neutral-300 text-lg font-semibold">
                                                {relevantEntry.entry}
                                            </span>
                                        </div>
                                        <p className="text-neutral-400 text-sm mt-1">
                                            <TimeStamp timestamp={relevantEntry.timestamp} />
                                        </p>
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EntryPage;
