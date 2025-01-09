// @lib/avatarCache.ts
type AvatarCache = { [username: string]: string };
type UserRoles = { [username: string]: string[] };

export class CacheManager {
    private avatarCache: AvatarCache = {};
    private userRoles: UserRoles = {};

    /**
     * Retrieves the authentication token from the cookie.
     * @returns The authentication token or `null` if no token is present.
     */
    private getToken(): string | null {
        return document.cookie
            .split("; ")
            .find((row) => row.startsWith("wordsofdeath="))
            ?.split("=")[1] || null;
    }

    /**
     * Fetches the avatar URL for a given user and stores it in the cache.
     * @param author The username of the author.
     * @returns The avatar URL or `null` if no URL is available.
     */
    async getAvatarUrl(author: string): Promise<string | null> {
        if (this.avatarCache[author]) {
            return this.avatarCache[author];
        }

        const token = this.getToken();
        if (!token) {
            console.error("Authentication token is missing.");
            return null;
        }

        try {
            const response = await fetch(`https://wordsofdeath-backend.vercel.app/api/user/u/${author}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.error(`Failed to fetch user data for ${author}: ${response.statusText}`);
                return null;
            }

            const data = await response.json();

            if (!data.avatar) {
                console.warn(`No avatar found for user: ${author}`);
                return null;
            }

            const avatarUrl = `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`;
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
