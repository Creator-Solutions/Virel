export type Role = 'pm' | 'developer' | 'qa';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface PaginatedUsers {
  data: User[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface UsersPageProps {
  users: PaginatedUsers;
}

export interface EditUserPageProps {
  user: User;
  errors?: Record<string, string[]>;
}

export interface InviteUserPayload {
  name: string;
  email: string;
  role: Role;
}

export interface UpdateUserPayload {
  name: string;
  email: string;
  role: Role;
}

export interface UpdatePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface ValidationErrors {
  [key: string]: string[];
}
