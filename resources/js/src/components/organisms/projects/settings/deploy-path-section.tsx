import { TextInput } from '@/src/components/atoms/text-input';
import { FormLabel } from '@/src/components/atoms/form-label';
import { FormError } from '@/src/components/atoms/form-error';
import { SectionDivider } from '@/src/components/atoms/section-divider';

interface DeployPathSectionProps {
  formData: {
    deploy_path: string;
  };
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function DeployPathSection({ formData, errors, onChange }: DeployPathSectionProps) {
  return (
    <SectionDivider heading="Deploy Path">
      <div>
        <FormLabel htmlFor="deploy_path" className="mb-1 block">
          Absolute Server Path
        </FormLabel>
        <TextInput
          id="deploy_path"
          name="deploy_path"
          value={formData.deploy_path}
          onChange={onChange}
          className="font-mono"
          placeholder="/home/username/public_html"
        />
        <p className="mt-2 text-sm text-virel-textSecondary">
          Absolute server path where files will be deployed, e.g.{' '}
          <span className="font-mono text-xs">/home/username/public_html</span>
        </p>
        <FormError message={errors.deploy_path} />
      </div>
    </SectionDivider>
  );
}

export { DeployPathSection };
export type { DeployPathSectionProps };
