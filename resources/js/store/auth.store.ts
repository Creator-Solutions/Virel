import { create } from 'zustand';
import type {
    AuthUser,
    AuthState,
    LoginCredentials,
} from '@/domains/auth/auth.types';
import { authService } from '@/domains/auth/auth.service';
import { userRepository } from '@/domains/auth/user.repository';

interface AuthStore extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: AuthUser) => void;
    clearError: () => void;
    hydrate: () => void;
    loginWithGithub: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: userRepository.get(),
    isAuthenticated: userRepository.exists(),
    isLoading: false,
    error: null,

    hydrate: () => {
        const user = userRepository.get();
        set({ user, isAuthenticated: user !== null });
    },

    setUser: (user: AuthUser) => {
        userRepository.set(user);
        set({ user, isAuthenticated: true });
    },

    clearError: () => set({ error: null }),

    login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });

        try {
            const response = await authService.login(credentials);
            userRepository.set(response.user);
            set({
                user: response.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch (err: unknown) {
            const error = err as { message?: string };
            set({
                isLoading: false,
                error: error?.message ?? 'Login failed. Please try again.',
                user: null,
                isAuthenticated: false,
            });

            throw err;
        }
    },

    logout: async () => {
        set({ isLoading: true });

        try {
            await authService.logout();
        } finally {
            userRepository.clear();
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        }
    },

    loginWithGithub: () => {
        authService.loginWithGithub();
    },
}));
