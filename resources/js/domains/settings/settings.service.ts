import type {
  UpdateProfilePayload,
  UpdatePasswordPayload,
  UpdateNotificationPayload,
  SiteSettings,
} from './settings.types';

const BASE_URL = '/home/settings';

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
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const settingsService = {
  async updateProfile(payload: UpdateProfilePayload): Promise<void> {
    await request<void>(`${BASE_URL}/profile`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async updatePassword(payload: UpdatePasswordPayload): Promise<void> {
    await request<void>(`${BASE_URL}/password`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async updateNotifications(payload: UpdateNotificationPayload): Promise<void> {
    await request<void>(`${BASE_URL}/notifications`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async getSiteSettings(): Promise<SiteSettings> {
    return request<SiteSettings>(`${BASE_URL}/data`);
  },

  async updateSiteSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    return request<SiteSettings>(`${BASE_URL}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

export const updateProfile = settingsService.updateProfile;
export const updatePassword = settingsService.updatePassword;
export const updateNotifications = settingsService.updateNotifications;
export const getSiteSettings = settingsService.getSiteSettings;
export const updateSiteSettings = settingsService.updateSiteSettings;
