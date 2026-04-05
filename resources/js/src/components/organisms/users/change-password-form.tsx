import { useState } from 'react';

import { PasswordInput } from '@/src/components/atoms/password-input';
import { FormLabel } from '@/src/components/atoms/form-label';
import { FormError } from '@/src/components/atoms/form-error';
import { Button } from '@/src/components/atoms/button';
import { SectionDivider } from '@/src/components/atoms/section-divider';
import type { UpdatePasswordPayload } from '@/domains/users/users.types';

interface ChangePasswordFormProps {
  errors?: Record<string, string[]>;
  onSubmit: (payload: UpdatePasswordPayload) => void;
  isLoading?: boolean;
}

function ChangePasswordForm({ errors = {}, onSubmit, isLoading }: ChangePasswordFormProps) {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit({
      current_password: formData.current_password,
      new_password: formData.new_password,
      new_password_confirmation: formData.new_password_confirmation,
    });
  };

  return (
    <div className="space-y-6">
      <SectionDivider heading="Change Password">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <FormLabel htmlFor="current_password">Current Password</FormLabel>
            <PasswordInput
              id="current_password"
              name="current_password"
              value={formData.current_password}
              onChange={handleChange}
              placeholder="Enter current password"
            />
            <FormError message={errors.current_password?.[0]} />
          </div>
          <div>
            <FormLabel htmlFor="new_password">New Password</FormLabel>
            <PasswordInput
              id="new_password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              placeholder="Enter new password"
            />
            <FormError message={errors.new_password?.[0]} />
          </div>
          <div>
            <FormLabel htmlFor="new_password_confirmation">Confirm New Password</FormLabel>
            <PasswordInput
              id="new_password_confirmation"
              name="new_password_confirmation"
              value={formData.new_password_confirmation}
              onChange={handleChange}
              placeholder="Confirm new password"
            />
            <FormError message={errors.new_password_confirmation?.[0]} />
          </div>
        </div>
      </SectionDivider>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-virel-text text-virel-base hover:bg-virel-text/90"
        >
          {isLoading ? 'Updating Password...' : 'Update Password'}
        </Button>
      </div>
    </div>
  );
}

export { ChangePasswordForm };
export type { ChangePasswordFormProps };
