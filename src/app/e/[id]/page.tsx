/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import { Entry, User } from "@/types";
import type { Metadata, ResolvingMetadata } from "next";
import { UserRoleBadges } from "@/components/UserRoleBadges";
import { TimeStamp } from "@/components/Timestamp";
import { UserAvatar } from "@/components/Useravatar";

interface EntryProps {
    params: Promise<{ id: string }>;
}

const API_BASE_URL = "http://localhost:3001/api";
// const API_DEV_URL = "http://localhost:3001/api";

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
            <div className="min-h-screen bg-zinc-900 text-zinc-200 flex items-center justify-center py-12 px-6">
                <div className="max-w-3xl w-full p-8 rounded-xl shadow-2xl bg-zinc-800">
                    <div className="text-3xl font-bold mb-4 bg-zinc-700 rounded h-8 w-1/2 animate-pulse"></div>
                    <div className="text-sm text-zinc-400 mb-6 flex items-center space-x-1">
                        <div className="rounded-full bg-zinc-700 w-5 h-5 animate-pulse"></div>
                        <span className="bg-zinc-700 h-4 w-3/4 rounded animate-pulse"></span>
                    </div>

                    <div className="mt-6">
                        <div className="text-xl font-semibold mb-3 bg-zinc-700 rounded h-6 w-1/3 animate-pulse"></div>
                        <div className="bg-zinc-700 p-4 rounded-xl animate-pulse"></div>
                    </div>

                    <div className="mt-6">
                        <div className="text-xl font-semibold mb-3 bg-zinc-700 rounded h-6 w-1/3 animate-pulse"></div>
                        <div className="flex flex-wrap gap-2">
                            {[...Array(3)].map((_, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-zinc-700 border-2 border-zinc-700 text-zinc-200 rounded-full text-sm animate-pulse"
                                ></span>
                            ))}
                        </div>
                    </div>

                    <div className="p-2 mt-8 w-fit flex items-center rounded-xl bg-zinc-800 border-2 border-zinc-800 animate-pulse">
                        <div className="rounded-full bg-zinc-700 w-9 h-9 mr-4 animate-pulse"></div>
                        <div className="h-5 bg-zinc-700 rounded w-1/3 animate-pulse"></div>
                    </div>

                    <div className="mt-12">
                        <div className="text-xl font-semibold mb-3 bg-zinc-700 rounded h-6 w-1/3 animate-pulse"></div>
                        <div className="flex flex-col space-y-4">
                            {[...Array(3)].map((_, index) => (
                                <div key={index} className="p-4 rounded-xl bg-zinc-700 border-2 border-zinc-700 animate-pulse">
                                    <div className="h-5 bg-zinc-600 rounded w-3/4 mb-2 animate-pulse"></div>
                                    <div className="h-4 bg-zinc-600 rounded w-1/2 animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    </div>
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
        <div className="min-h-screen bg-zinc-900 text-zinc-200 cursor-default flex items-center justify-center py-12 px-6">
            <div className="max-w-3xl w-full p-8 rounded-xl shadow-2xl bg-zinc-800">
                <h2 className="text-3xl font-bold mb-4 break-words">{entry.entry}</h2>
                <div className="text-sm text-zinc-400 mb-6 flex items-center space-x-1">
                    <TimeStamp timestamp={entry.timestamp} />
                </div>

                {entry.variation.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3 text-zinc-200">Variationen</h3>
                        <div className="bg-zinc-700 p-4 rounded-xl">
                            <ul className="list-disc ml-6 space-y-1">
                                {entry.variation.map((var1, index) => (
                                    <li key={index} className="text-zinc-300">
                                        {var1}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {entry.categories.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3 text-zinc-200">Kategorien</h3>
                        <div className="flex flex-wrap gap-2">
                            {entry.categories.map((category, index) => (
                                <Link key={index} href={`/c/${category}`} passHref>
                                    <span
                                        className="px-3 py-1 bg-zinc-700 border-2 border-zinc-700 text-zinc-200 rounded-full text-sm cursor-pointer hover:bg-zinc-800 transition-all duration-300">
                                        {category}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {user && (
                    <Link href={`/u/${user.username}`}>
                        <div
                            className="p-2 mt-8 w-fit flex items-center space-x-2 rounded-xl bg-zinc-800 hover:bg-zinc-600 border-2 border-zinc-800 transition-all transform hover:rounded-xl hover:scale-[1.04]">
                            <UserAvatar avatarUrl={user.avatar} id={user.id} username={user.username} />
                            <span className="text-lg font-medium">von @{user.username}</span>
                            {user.roles && <UserRoleBadges roles={user.roles} />}
                        </div>
                    </Link>
                )}

                {relevantEntries && relevantEntries.length > 0 && (
                    <div className="mt-12">
                        <h3 className="text-xl font-semibold mb-3 text-zinc-200">Verwandte Einträge</h3>
                        <div className="flex flex-col space-y-4">
                            {relevantEntries.map((relevantEntry) => (
                                <Link key={relevantEntry.id} href={`/e/${relevantEntry.id}`} passHref>
                                    <span
                                        className="block p-4 rounded-xl bg-zinc-700 border-2 border-zinc-700 transition-all transform hover:rounded-3xl hover:scale-[1.02] hover:bg-zinc-800">
                                        <div>
                                            <button
                                                className="text-zinc-300 text-lg font-medium">
                                                {relevantEntry.entry}
                                            </button>
                                        </div>
                                        <p className="text-zinc-400 text-sm mt-1">
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
