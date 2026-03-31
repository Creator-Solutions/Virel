import { TextInput } from '@/src/components/atoms/text-input';
import { FormLabel } from '@/src/components/atoms/form-label';
import { FormError } from '@/src/components/atoms/form-error';
import { FormFieldGrid } from '@/src/components/molecules/form-field-grid';

interface GeneralSettingsSectionProps {
  formData: {
    name: string;
    public_url: string;
  };
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
