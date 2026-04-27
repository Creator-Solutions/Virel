import type { InviteUserPayload, PaginatedUsers, UpdateUserPayload, UpdatePasswordPayload } from './users.types';

const BASE_URL = '/home/users';

function getCsrfToken(): string {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

  return match ? decodeURIComponent(match[1]) : '';
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-XSRF-TOKEN': getCsrfToken(),
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const usersService = {
  async getUsers(page = 1): Promise<PaginatedUsers> {
    return request<PaginatedUsers>(`${BASE_URL}?page=${page}`);
  },

  async inviteUser(payload: InviteUserPayload): Promise<void> {
    await request<void>(`${BASE_URL}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async deleteUser(id: string): Promise<void> {
    await request<void>(`${BASE_URL}/${id}`, { method: 'DELETE' });
  },

  async updateUser(id: string, payload: UpdateUserPayload): Promise<void> {
    await request<void>(`${BASE_URL}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async updateUserPassword(id: string, payload: UpdatePasswordPayload): Promise<void> {
    await request<void>(`${BASE_URL}/${id}/password`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};

export const getUsers = usersService.getUsers;
export const inviteUser = usersService.inviteUser;
export const deleteUser = usersService.deleteUser;
export const updateUser = usersService.updateUser;
export const updateUserPassword = usersService.updateUserPassword;
