import { AuthUser } from './auth.types';

const USER_KEY = 'virel_user';

export const userRepository = {
    get(): AuthUser | null {
        try {
            const raw = localStorage.getItem(USER_KEY);
            if (!raw) return null;
            return JSON.parse(raw) as AuthUser;
        } catch {
            return null;
        }
    },

    set(user: AuthUser): void {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    clear(): void {
        localStorage.removeItem(USER_KEY);
    },

    exists(): boolean {
        return localStorage.getItem(USER_KEY) !== null;
    },
};
