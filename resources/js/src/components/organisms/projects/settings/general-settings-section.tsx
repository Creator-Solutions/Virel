import * as React from 'react';

import { TextInput } from '@/src/components/atoms/text-input';
import { FormLabel } from '@/src/components/atoms/form-label';
import { FormError } from '@/src/components/atoms/form-error';
import { FormFieldGrid } from '@/src/components/molecules/form-field-grid';
import { SelectField } from '@/src/components/molecules/select-field';

const ENVIRONMENT_OPTIONS = [
  { value: 'production', label: 'Production' },
  { value: 'staging', label: 'Staging' },
  { value: 'development', label: 'Development' },
];

interface GeneralSettingsSectionProps {
  formData: {
    name: string;
    environment: string;
    public_url: string;
  };
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

function GeneralSettingsSection({ formData, errors, onChange }: GeneralSettingsSectionProps) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-medium text-virel-text">General</h2>
      <FormFieldGrid>
        <div>
          <FormLabel htmlFor="name" className="mb-1 block">
            Project Name
          </FormLabel>
          <TextInput
            id="name"
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="e.g. acme-marketing-site"
          />
          <FormError message={errors.name} />
        </div>
        <div>
          <FormLabel htmlFor="environment" className="mb-1 block">
            Environment
          </FormLabel>
          <SelectField
            id="environment"
            name="environment"
            value={formData.environment}
            onChange={onChange}
            options={ENVIRONMENT_OPTIONS}
            placeholder="Select environment"
            error={errors.environment}
          />
        </div>
        <div className="col-span-2">
          <FormLabel htmlFor="public_url" className="mb-1 block" optional>
            Public URL
          </FormLabel>
          <TextInput
            id="public_url"
            name="public_url"
            type="url"
            value={formData.public_url}
            onChange={onChange}
            placeholder="https://acme.com"
          />
          <FormError message={errors.public_url} />
        </div>
      </FormFieldGrid>
    </section>
  );
}

export { GeneralSettingsSection };
export type { GeneralSettingsSectionProps };
