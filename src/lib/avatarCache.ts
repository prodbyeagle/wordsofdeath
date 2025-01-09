// @lib/avatarCache.ts
type AvatarCache = { [username: string]: string };
type UserRoles = { [username: string]: string[] };

export class AvatarCacheManager {
    private avatarCache: AvatarCache = {};
    private userRoles: UserRoles = {};

    constructor(private fetchUserData: (author: string) => Promise<string | null>) { }

    async getAvatarUrl(author: string): Promise<string | null> {
        if (this.avatarCache[author]) {
            return this.avatarCache[author];
        }

        const avatarUrl = await this.fetchUserData(author);

        if (avatarUrl) {
            this.avatarCache[author] = avatarUrl;
        }

        return avatarUrl;
    }

    getRoles(username: string): string[] {
        return this.userRoles[username] || [];
    }

    public getAvatarCache(): AvatarCache {
        return this.avatarCache;
    }
}
