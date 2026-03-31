import type { LoginCredentials, LoginResponse } from './auth.types';

const BASE_URL = '/api/v1/auth';

function getCsrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

async function post<T>(url: string, body: unknown): Promise<T> {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-XSRF-TOKEN': getCsrfToken(),
        },
        credentials: 'include',
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: 'An unexpected error occurred',
        }));

        throw error;
    }

    return response.json();
}

export const authService = {
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        return post<LoginResponse>(`${BASE_URL}/login`, credentials);
    },

    async logout(): Promise<void> {
        await post<void>(`${BASE_URL}/logout`, {});
    },

    async forgotPassword(email: string): Promise<{ message: string }> {
        return post<{ message: string }>(`${BASE_URL}/forgot-password`, {
            email,
        });
    },

    async resetPassword(
        token: string,
        email: string,
        password: string,
        password_confirmation: string,
    ): Promise<{ message: string }> {
        return post<{ message: string }>(`${BASE_URL}/reset-password`, {
            token,
            email,
            password,
            password_confirmation,
        });
    },

    loginWithGithub(): void {
        window.location.href = '/api/v1/auth/github-oauth';
    },
};
