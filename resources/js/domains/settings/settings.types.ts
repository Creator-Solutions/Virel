export interface SettingsUser {
  id: string;
  name: string;
  email: string;
  role: string;
  github_id: string | null;
  avatar_url: string | null;
  is_github_account: boolean;
  notify_deployment_success: boolean;
  notify_deployment_failure: boolean;
}

export interface SettingsPageProps {
  user: SettingsUser;
  errors?: Record<string, string[]>;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
}

export interface UpdatePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface UpdateNotificationPayload {
  notify_deployment_success: boolean;
  notify_deployment_failure: boolean;
}

export interface SiteSettings {
  virel_url: string;
}
