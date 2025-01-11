import { fetchUserDataByUsername } from "./api";

// @lib/avatarCache.ts
type AvatarCache = { [username: string]: string };
type UserRoles = { [username: string]: string[] };

export class CacheManager {
    private avatarCache: AvatarCache = {};
    private userRoles: UserRoles = {};

    /**
     * Retrieves the authentication token from cookies.
     * @returns The authentication token or null if not found.
     */
    getAuthToken = (): string | null => {
        const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("wordsofdeath="))?.split("=")[1] || null;
        return token;
    };

    /**
     * Fetches the avatar URL for a given user and stores it in the cache.
     * @param author The username of the author.
     * @returns The avatar URL or `null` if no URL is available.
     */
    async getAvatarUrl(author: string): Promise<string | null> {
        if (this.avatarCache[author]) {
            return this.avatarCache[author];
        }

        const token = this.getAuthToken();
        if (!token) {
            console.error("Authentication token is missing.");
            return null;
        }

        try {
            const response = await fetchUserDataByUsername(author, token)
            if (!response) {
                console.error(`No response received for user: ${author}`);
                return null;
            }
            const data = response;

            if (!data.avatar) {
                console.warn(`No avatar found for user: ${author}`);
                return null;
            }

            const avatarUrl = `/${data.avatar}.png`;
            this.avatarCache[author] = avatarUrl;

            if (Array.isArray(data.roles)) {
                this.userRoles[author] = data.roles;
            }

            return avatarUrl;
        } catch (err) {
            console.error(`Error fetching user data for ${author}:`, err);
            return null;
        }
    }

    /**
     * Retrieves the roles of a user. Returns an empty list if no roles are present.
     * @param username The username of the user.
     * @returns A list of roles.
     */
    getRoles(username: string): string[] {
        return this.userRoles[username] || [];
    }

    /**
     * Returns the current avatar cache (for debugging purposes).
     * @returns The avatar cache.
     */
    public getAvatarCache(): AvatarCache {
        return this.avatarCache;
    }

    /**
     * Returns the cached roles (for debugging purposes).
     * @returns The role cache.
     */
    public getRoleCache(): UserRoles {
        return this.userRoles;
    }
}
