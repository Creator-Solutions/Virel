import { create } from 'zustand';
import type { PaginatedUsers, ValidationErrors, InviteUserPayload } from '@/domains/users/users.types';

interface UsersStore {
  users: PaginatedUsers;
  isLoading: boolean;
  errors: ValidationErrors;
  setUsers: (users: PaginatedUsers) => void;
  setLoading: (loading: boolean) => void;
  setErrors: (errors: ValidationErrors) => void;
}

export const useUsersStore = create<UsersStore>((set) => ({
  users: {
    data: [],
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  },
  isLoading: false,
  errors: {},
  setUsers: (users) => set({ users }),
  setLoading: (isLoading) => set({ isLoading }),
  setErrors: (errors) => set({ errors }),
}));
