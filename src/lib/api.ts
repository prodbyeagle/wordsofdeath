import type { Entry, User, Whitelist } from "@/types";
import { CacheManager } from "./avatarCache";

/**
 * Retrieves the authentication token from cookies.
 * @returns The authentication token or null if not found.
 */
export const getAuthToken = (): string | null => {
    const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("wordsofdeath="))?.split("=")[1] || null;
    return token;
};

/**
 * A helper function to handle API requests efficiently with caching.
 */
const fetchData = async <T>(url: string, token: string): Promise<T | null> => {
    try {
        const response = await fetch(`${getBaseApiUrl()}${url}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Request failed.");
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        return null;
    }
};

/**
 * Determines the base URL for the API based on the environment (development or production).
 */
const getBaseApiUrl = (): string => {
    return process.env.NEXT_PUBLIC_DEVELOPMENT === "true"
        ? "http://localhost:3001"
        : "https://wordsofdeath-backend.vercel.app";
};

/**
 * Fetches the admin status of the current user.
 * @param token The authentication token.
 * @returns True if the user is an admin, otherwise false.
 */
export const fetchAdminStatus = async (token: string): Promise<boolean> => {
    const data = await fetchData<{ isAdmin: boolean }>("/api/auth/admin", token);
    return data ? data.isAdmin : false;
};

/**
 * Fetches the whitelist of users.
 * @param token The authentication token.
 * @returns An array of whitelisted users.
 */
export const fetchWhitelistedUsers = async (token: string): Promise<Whitelist[]> => {
    const data = await fetchData<Whitelist[]>("/api/whitelist", token);
    return data ? data.map((user) => ({
        _id: user._id,
        username: user.username,
        added_at: user.added_at,
    })) : [];
};

/**
 * Adds a user to the whitelist.
 * @param token The authentication token.
 * @param username The username of the user to add.
 * @returns The added user data or null if the addition fails.
 */
export const addUserToWhitelist = async (
    token: string,
    username: string
): Promise<Whitelist | null> => {
    try {
        const response = await fetch(`${getBaseApiUrl()}/api/whitelist`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username }),
        });

        if (!response.ok) throw new Error("Failed to add user to whitelist.");
        const user: User = await response.json();

        return {
            _id: user._id,
            username: user.username,
            added_at: new Date().toISOString(),
        };
    } catch (error) {
        console.error("Error adding user to whitelist:", error);
        return null;
    }
};

/**
 * Removes a user from the whitelist.
 * @param token The authentication token.
 * @param username The username of the user to remove.
 * @returns True if the user was successfully removed, otherwise false.
 */
export const removeUserFromWhitelist = async (
    token: string,
    username: string
): Promise<boolean> => {
    try {
        const response = await fetch(`${getBaseApiUrl()}/api/whitelist/${username}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.ok;
    } catch (error) {
        console.error("Error removing user from whitelist:", error);
        return false;
    }
};

/**
 * Fetches a subset of entries from the API.
 * @param token The authentication token.
 * @param limit The number of entries to fetch.
 * @returns A list of entries or an empty array if the request fails.
 */
export const fetchSomeEntries = async (token: string, limit: number = 5): Promise<Entry[]> => {
    const data = await fetchData<Entry[]>(`/api/entries/some?limit=${limit}`, token);
    return data || [];
};

/**
 * Fetches a list of entries from the API.
 * @param token The authentication token.
 * @returns A list of entries or an empty array if the request fails.
 */
export const fetchEntries = async (token: string): Promise<Entry[]> => {
    const data = await fetchData<Entry[]>("/api/entries", token);
    if (data) {
        return Array.from(new Set(data.map((entry) => entry.id))).map((id) => data.find((entry) => entry.id === id)!);
    }
    return [];
};

/**
 * Fetches entries for a specific user by their username.
 * @param username The username of the user.
 * @param token The authentication token.
 * @returns A list of entries or an empty array if the request fails.
 */
export const fetchEntriesByUsername = async (
    username: string,
    token: string
): Promise<Entry[]> => {
    const data = await fetchData<Entry[]>(`/api/entries/u/${username}`, token);
    return data || [];
};

/**
 * Fetches user data by their username.
 * @param username The username of the user.
 * @param token The authentication token.
 * @returns The user data or `null` if the request fails.
 */
export const fetchUserDataByUsername = async (
    username: string,
    token: string
): Promise<User | null> => {
    const data = await fetchData<User>(`/api/user/u/${username}`, token);
    return data || null;
};

/**
 * Creates a new entry for the user.
 * @param newEntry The text of the new entry.
 * @param categories A comma-separated list of categories for the entry.
 * @param user The user object containing the username.
 * @returns An error message in case of failure, or `null` if the entry was created successfully.
 */
export const createEntry = async (
    newEntry: string,
    categories: string,
    user: { username: string } | null
): Promise<string | null> => {
    const token = getAuthToken();

    if (!token || !newEntry.trim()) {
        return "Kein Token oder leerer Eintrag.";
    }

    try {
        const response = await fetch(`${getBaseApiUrl()}/api/entries`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                entry: newEntry,
                timestamp: new Date().toISOString(),
                categories: categories.split(",").map((cat) => cat.trim()).filter(Boolean),
                author: user?.username,
            }),
        });

        if (response.ok) {
            return null;
        } else {
            return `Fehler beim Erstellen des Eintrags: ${response.statusText}`;
        }
        /* eslint-disable @typescript-eslint/no-unused-vars */
    } catch (error) {
        return "Fehler beim Erstellen des Eintrags.";
    }
};

/**
 * Deletes an entry by its ID.
 * @param token The authentication token.
 * @param entryId The ID of the entry to delete.
 * @returns Null if the entry was successfully deleted, otherwise an error message.
 */
export const deleteEntry = async (token: string, entryId: string): Promise<string | null> => {
    try {
        const response = await fetch(`${getBaseApiUrl()}/api/entries/${entryId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            return null;
        } else {
            const errorMessage = `Failed to delete entry: ${response.statusText}`;
            console.error(errorMessage);
            return errorMessage;
        }
    } catch (error) {
        const errorMessage = `Error deleting entry: ${error}`;
        console.error(errorMessage);
        return errorMessage;
    }
};

/**
 * Fetches the user Avatar, if the cache manager is provided.
 * @param author The username of the author.
 * @param avatarCacheManager An optional CacheManager instance to retrieve the avatar URL.
 * @returns The avatar URL or `null` if the avatar data is not found.
 */
export const fetchUserAvatar = async (
    author: string,
    avatarCacheManager: CacheManager | null
): Promise<string | null> => {
    if (avatarCacheManager) {
        return await avatarCacheManager.getAvatarUrl(author);
    }
    return null;
};
