// lib/api.ts
import type { Entry } from "@/types";
import { AvatarCacheManager } from "./avatarCache";

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

export const fetchUserData = async (
    author: string,
    avatarCacheManager: AvatarCacheManager | null
): Promise<string | null> => {
    if (avatarCacheManager) {
        return await avatarCacheManager.getAvatarUrl(author);
    }
    return null;
};
