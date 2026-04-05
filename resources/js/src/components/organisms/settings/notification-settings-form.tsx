import { useState } from 'react';

import { Toggle } from '@/src/components/atoms/toggle';
import { Button } from '@/src/components/atoms/button';
import { SectionDivider } from '@/src/components/atoms/section-divider';
import type { SettingsUser, UpdateNotificationPayload } from '@/domains/settings/settings.types';

interface NotificationSettingsFormProps {
  user: SettingsUser;
  errors?: Record<string, string[]>;
  onSubmit: (payload: UpdateNotificationPayload) => void;
  isLoading?: boolean;
}

function NotificationSettingsForm({ user, onSubmit, isLoading }: NotificationSettingsFormProps) {
  const [formData, setFormData] = useState({
    notify_deployment_success: user.notify_deployment_success,
    notify_deployment_failure: user.notify_deployment_failure,
  });

  const handleChange = (name: keyof typeof formData) => (checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = () => {
    onSubmit({
      notify_deployment_success: formData.notify_deployment_success,
      notify_deployment_failure: formData.notify_deployment_failure,
    });
  };

  return (
    <div className="space-y-8">
      <SectionDivider heading="Notification Preferences">
        <div className="space-y-4">
          <Toggle
            id="notify_deployment_success"
            name="notify_deployment_success"
            checked={formData.notify_deployment_success}
            onChange={handleChange('notify_deployment_success')}
            label="Deployment Success"
            description="Receive notifications when deployments complete successfully"
          />
          <Toggle
            id="notify_deployment_failure"
            name="notify_deployment_failure"
            checked={formData.notify_deployment_failure}
            onChange={handleChange('notify_deployment_failure')}
            label="Deployment Failure"
            description="Receive notifications when deployments fail"
          />
        </div>
      </SectionDivider>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-virel-text text-virel-base hover:bg-virel-text/90"
        >
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}

export { NotificationSettingsForm };
export type { NotificationSettingsFormProps };
