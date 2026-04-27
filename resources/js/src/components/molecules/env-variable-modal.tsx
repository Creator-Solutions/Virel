import * as React from 'react';

import { Button } from '@/src/components/atoms/button';
import { TextField } from '@/src/components/molecules/text-field';
import { PasswordField } from '@/src/components/molecules/password-field';
import { SelectField } from '@/src/components/molecules/select-field';
import { AlertBanner } from '@/src/components/molecules/alert-banner';

interface EnvVariableModalProps {
  isOpen: boolean;
  isEditing: boolean;
  isLoading: boolean;
  formData: {
    key: string;
    value: string;
    environment: string;
  };
  formError: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onKeyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEnvironmentChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const environmentOptions = [
  { value: 'development', label: 'Development' },
  { value: 'staging', label: 'Staging' },
  { value: 'production', label: 'Production' },
];

function EnvVariableModal({
  isOpen,
  isEditing,
  isLoading,
  formData,
  formError,
  onClose,
  onSubmit,
  onKeyChange,
  onValueChange,
  onEnvironmentChange,
}: EnvVariableModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-virel-border bg-virel-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-virel-text">{isEditing ? 'Edit Variable' : 'Add Variable'}</h2>

        {formError && (
          <AlertBanner variant="error" className="mb-4">
            {formError}
          </AlertBanner>
        )}

        <form onSubmit={onSubmit}>
          {!isEditing && (
            <TextField
              label="Key"
              name="key"
              value={formData.key}
              onChange={onKeyChange}
              placeholder="API_KEY"
              hint="Use uppercase with underscores"
            />
          )}

          <div className="mt-4">
            <PasswordField
              label="Value"
              name="value"
              value={formData.value}
              onChange={onValueChange}
              placeholder={isEditing ? 'Leave empty to keep current' : 'Enter value'}
            />
          </div>

          {!isEditing && (
            <div className="mt-4">
              <SelectField
                label="Environment"
                name="environment"
                value={formData.environment}
                onChange={onEnvironmentChange}
                options={environmentOptions}
                id="environment"
              />
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { EnvVariableModal };
export type { EnvVariableModalProps };
