import { useState, useEffect } from 'react';

import { TextField } from '@/src/components/molecules/text-field';
import { SelectField } from '@/src/components/molecules/select-field';
import { Button } from '@/src/components/atoms/button';
import { SectionDivider } from '@/src/components/atoms/section-divider';
import type { MailSettings, UpdateMailPayload } from '@/domains/settings/settings.types';

interface EmailSettingsFormProps {
  mailSettings: MailSettings;
  onSubmit: (payload: UpdateMailPayload) => void;
  isLoading?: boolean;
}

function EmailSettingsForm({ mailSettings, onSubmit, isLoading }: EmailSettingsFormProps) {
  const [formData, setFormData] = useState<MailSettings>({
    MAIL_HOST: '',
    MAIL_PORT: '',
    MAIL_USERNAME: '',
    MAIL_PASSWORD: '',
    MAIL_ENCRYPTION: '',
    MAIL_FROM_ADDRESS: '',
    MAIL_FROM_NAME: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  useEffect(() => {
    if (mailSettings) {
      setFormData({
        MAIL_HOST: mailSettings.MAIL_HOST || '',
        MAIL_PORT: mailSettings.MAIL_PORT || '',
        MAIL_USERNAME: mailSettings.MAIL_USERNAME || '',
        MAIL_PASSWORD: mailSettings.MAIL_PASSWORD || '',
        MAIL_ENCRYPTION: mailSettings.MAIL_ENCRYPTION || '',
        MAIL_FROM_ADDRESS: mailSettings.MAIL_FROM_ADDRESS || '',
        MAIL_FROM_NAME: mailSettings.MAIL_FROM_NAME || '',
      });
    }
  }, [mailSettings]);

  const handleChange = (field: keyof MailSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const portValue = formData.MAIL_PORT ? Number(formData.MAIL_PORT) : undefined;

    if (!passwordTouched && formData.MAIL_PASSWORD === '********') {
      onSubmit({
        MAIL_HOST: formData.MAIL_HOST || undefined,
        MAIL_PORT: portValue,
        MAIL_USERNAME: formData.MAIL_USERNAME || undefined,
        MAIL_ENCRYPTION: formData.MAIL_ENCRYPTION as 'tls' | 'ssl' | 'none' | '',
        MAIL_FROM_ADDRESS: formData.MAIL_FROM_ADDRESS || undefined,
        MAIL_FROM_NAME: formData.MAIL_FROM_NAME || undefined,
      });
    } else {
      onSubmit({
        MAIL_HOST: formData.MAIL_HOST || undefined,
        MAIL_PORT: portValue,
        MAIL_USERNAME: formData.MAIL_USERNAME || undefined,
        MAIL_PASSWORD: formData.MAIL_PASSWORD || undefined,
        MAIL_ENCRYPTION: formData.MAIL_ENCRYPTION as 'tls' | 'ssl' | 'none' | '',
        MAIL_FROM_ADDRESS: formData.MAIL_FROM_ADDRESS || undefined,
        MAIL_FROM_NAME: formData.MAIL_FROM_NAME || undefined,
      });
    }
  };

  const hasPasswordValue = mailSettings.MAIL_PASSWORD && mailSettings.MAIL_PASSWORD === '********';

  return (
    <div className="space-y-8">
      <SectionDivider heading="Email (SMTP)">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextField
              id="MAIL_HOST"
              name="MAIL_HOST"
              label="SMTP Host"
              value={formData.MAIL_HOST}
              onChange={handleChange('MAIL_HOST')}
              placeholder="smtp.mailtrap.io"
            />
            <TextField
              id="MAIL_PORT"
              name="MAIL_PORT"
              label="SMTP Port"
              type="number"
              value={String(formData.MAIL_PORT)}
              onChange={handleChange('MAIL_PORT')}
              placeholder="587"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextField
              id="MAIL_USERNAME"
              name="MAIL_USERNAME"
              label="Username"
              value={formData.MAIL_USERNAME}
              onChange={handleChange('MAIL_USERNAME')}
              placeholder="username"
            />
            <TextField
              id="MAIL_PASSWORD"
              name="MAIL_PASSWORD"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={passwordTouched || !hasPasswordValue ? formData.MAIL_PASSWORD : ''}
              onChange={handleChange('MAIL_PASSWORD')}
              onBlur={() => setPasswordTouched(true)}
              placeholder={hasPasswordValue ? '••••••••' : 'password'}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-virel-textSubtle text-sm hover:text-virel-text"
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              }
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SelectField
              id="MAIL_ENCRYPTION"
              name="MAIL_ENCRYPTION"
              label="Encryption"
              value={formData.MAIL_ENCRYPTION}
              onChange={handleChange('MAIL_ENCRYPTION')}
              options={[
                { value: 'tls', label: 'TLS' },
                { value: 'ssl', label: 'SSL' },
                { value: 'none', label: 'None' },
              ]}
              placeholder="Select encryption"
            />
            <TextField
              id="MAIL_FROM_ADDRESS"
              name="MAIL_FROM_ADDRESS"
              label="From Address"
              type="email"
              value={formData.MAIL_FROM_ADDRESS}
              onChange={handleChange('MAIL_FROM_ADDRESS')}
              placeholder="noreply@example.com"
            />
          </div>
          <TextField
            id="MAIL_FROM_NAME"
            name="MAIL_FROM_NAME"
            label="From Name"
            value={formData.MAIL_FROM_NAME}
            onChange={handleChange('MAIL_FROM_NAME')}
            placeholder="Vrey CI/CD"
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
          {isLoading ? 'Saving...' : 'Save Email Settings'}
        </Button>
      </div>
    </div>
  );
}

export { EmailSettingsForm };
export type { EmailSettingsFormProps };
