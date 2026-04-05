import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { ProfileForm } from '@/src/components/organisms/settings/profile-form';
import { NotificationSettingsForm } from '@/src/components/organisms/settings/notification-settings-form';
import { ChangePasswordForm } from '@/src/components/organisms/users/change-password-form';
import { PageHeader } from '@/src/components/molecules/common/page-header';
import { TextField } from '@/src/components/molecules/text-field';
import { Button } from '@/src/components/atoms/button';
import type {
  SettingsPageProps,
  UpdateProfilePayload,
  UpdateNotificationPayload,
  SiteSettings,
} from '@/domains/settings/settings.types';
import {
  updateProfile,
  updatePassword,
  updateNotifications,
  getSiteSettings,
  updateSiteSettings,
} from '@/domains/settings/settings.service';
import type { UpdatePasswordPayload } from '@/domains/settings/settings.types';
import HomeLayout from '..';

const Settings = () => {
  const { user, errors: pageErrors } = usePage().props as unknown as SettingsPageProps;
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [isLoadingSite, setIsLoadingSite] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ virel_url: '' });
  const [siteFormData, setSiteFormData] = useState({ virel_url: '' });
  const [siteMessage, setSiteMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    getSiteSettings().then((settings) => {
      setSiteSettings(settings);
      setSiteFormData({ virel_url: settings.virel_url || '' });
    });
  }, []);

  const handleProfileUpdate = (payload: UpdateProfilePayload) => {
    setIsLoadingProfile(true);
    updateProfile(payload).finally(() => {
      setIsLoadingProfile(false);
    });
  };

  const handleNotificationUpdate = (payload: UpdateNotificationPayload) => {
    setIsLoadingNotifications(true);
    updateNotifications(payload).finally(() => {
      setIsLoadingNotifications(false);
    });
  };

  const handlePasswordUpdate = (payload: UpdatePasswordPayload) => {
    setIsLoadingPassword(true);
    updatePassword(payload).finally(() => {
      setIsLoadingPassword(false);
    });
  };

  const handleSiteUpdate = async () => {
    setIsLoadingSite(true);
    setSiteMessage(null);
    try {
      const updated = await updateSiteSettings({ virel_url: siteFormData.virel_url });
      setSiteSettings(updated);
      setSiteMessage({ type: 'success', text: 'Settings saved successfully.' });
    } catch {
      setSiteMessage({ type: 'error', text: 'Failed to save settings.' });
    } finally {
      setIsLoadingSite(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <PageHeader title="Settings" description="Manage your account preferences and security settings." />
      <div className="mx-auto max-w-3xl space-y-12">
        {/* Instance Settings */}
        <section>
          <h2 className="mb-4 text-lg font-medium text-virel-text">Instance Settings</h2>
          <div className="space-y-4 rounded-lg border border-virel-border bg-virel-surface p-6">
            <TextField
              id="virel_url"
              name="virel_url"
              label="Virel URL"
              value={siteFormData.virel_url}
              onChange={(e) => setSiteFormData({ virel_url: e.target.value })}
              placeholder="https://ci.myserver.com"
              hint="The public URL this Virel instance is accessible at, e.g. https://ci.myserver.com"
            />
            <div className="flex items-center gap-4">
              <Button type="button" onClick={handleSiteUpdate} disabled={isLoadingSite} className="btn-primary">
                {isLoadingSite ? 'Saving...' : 'Save'}
              </Button>
              {siteMessage && (
                <span
                  className={`text-sm ${siteMessage.type === 'success' ? 'text-virel-successText' : 'text-virel-errorText'}`}
                >
                  {siteMessage.text}
                </span>
              )}
            </div>
          </div>
        </section>

        <ProfileForm user={user} errors={pageErrors} onSubmit={handleProfileUpdate} isLoading={isLoadingProfile} />
        <NotificationSettingsForm
          user={user}
          errors={pageErrors}
          onSubmit={handleNotificationUpdate}
          isLoading={isLoadingNotifications}
        />
        <ChangePasswordForm errors={pageErrors} onSubmit={handlePasswordUpdate} isLoading={isLoadingPassword} />
      </div>
    </div>
  );
};

Settings.layout = (page: ReactNode) => <HomeLayout>{page}</HomeLayout>;

export default Settings;
