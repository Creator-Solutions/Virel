export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: string;
    github_id: string | null;
    avatar_url: string | null;
    is_github_account: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: AuthUser;
}

export interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}
