// lib/api.ts
import type { Entry } from "@/types";
import { CacheManager } from "./avatarCache";

/**
 * Fetches a list of entries from the API.
 * @param token The authentication token.
 * @returns A list of entries or an empty array if the request fails.
 */
export const fetchEntries = async (token: string): Promise<Entry[]> => {
    try {
        const response = await fetch("http://localhost:3001/api/entries", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) throw new Error("Failed to fetch entries");

        const data: Entry[] = await response.json();

        if (Array.isArray(data)) {
            return data.filter(
                (entry, index, self) =>
                    index === self.findIndex((e) => e.id === entry.id)
            );
        } else {
            throw new Error("Invalid entries data format");
        }
    } catch (error) {
        console.error("Error fetching entries:", error);
        return [];
    }
};

/**
 * Fetches user data, including the avatar URL if the cache manager is provided.
 * @param author The username of the author.
 * @param avatarCacheManager An optional CacheManager instance to retrieve the avatar URL.
 * @returns The avatar URL or `null` if the avatar data is not found.
 */
export const fetchUserData = async (
    author: string,
    avatarCacheManager: CacheManager | null
): Promise<string | null> => {
    if (avatarCacheManager) {
        return await avatarCacheManager.getAvatarUrl(author);
    }
    return null;
};
