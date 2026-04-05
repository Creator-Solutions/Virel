import { useState } from 'react';

import { TextInput } from '@/src/components/atoms/text-input';
import { PasswordInput } from '@/src/components/atoms/password-input';
import { Button } from '@/src/components/atoms/button';
import { FormLabel } from '@/src/components/atoms/form-label';
import { FormError } from '@/src/components/atoms/form-error';
import { SectionDivider } from '@/src/components/atoms/section-divider';
import { FormFieldGrid } from '@/src/components/molecules/form-field-grid';

interface GitHubSettingsSectionProps {
  formData: {
    github_owner: string;
    github_repo: string;
    github_branch: string;
    github_pat: string;
  };
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPatSave?: () => void;
  isSavingPat?: boolean;
  patSaveMessage?: string | null;
  patError?: string | null;
}

function GitHubSettingsSection({
  formData,
  errors,
  onChange,
  onPatSave,
  isSavingPat = false,
  patSaveMessage,
  patError,
}: GitHubSettingsSectionProps) {
  return (
    <SectionDivider heading="GitHub Repository">
      <FormFieldGrid className="mb-4">
        <div>
          <FormLabel htmlFor="github_owner" className="mb-1 block">
            Owner / Organization
          </FormLabel>
          <TextInput
            id="github_owner"
            name="github_owner"
            value={formData.github_owner}
            onChange={onChange}
            placeholder="e.g. acme-corp"
          />
          <FormError message={errors.github_owner} />
        </div>
        <div>
          <FormLabel htmlFor="github_repo" className="mb-1 block">
            Repository Name
          </FormLabel>
          <TextInput
            id="github_repo"
            name="github_repo"
            value={formData.github_repo}
            onChange={onChange}
            placeholder="e.g. marketing-site"
          />
          <FormError message={errors.github_repo} />
        </div>
      </FormFieldGrid>

      <FormFieldGrid>
        <div>
          <FormLabel htmlFor="github_branch" className="mb-1 block">
            Branch
          </FormLabel>
          <TextInput
            id="github_branch"
            name="github_branch"
            value={formData.github_branch}
            onChange={onChange}
            placeholder="main"
          />
          <FormError message={errors.github_branch} />
        </div>
        <div>
          <FormLabel htmlFor="github_pat" className="mb-1 block">
            Personal Access Token
          </FormLabel>
          <PasswordInput
            id="github_pat"
            name="github_pat"
            value={formData.github_pat}
            onChange={onChange}
            placeholder="Leave empty to keep current token"
          />
          <p className="mt-2 text-sm text-virel-textSecondary">
            Personal access token. Required scopes: <span className="font-mono text-xs">repo</span>
          </p>
          <p className="mt-1 text-xs text-virel-textSecondary">
            Updating your PAT will automatically configure the GitHub webhook and workflow file for this project.
          </p>
          <FormError message={errors.github_pat} />

          {patSaveMessage && <p className="mt-2 text-sm text-virel-successText">{patSaveMessage}</p>}
          {patError && <p className="mt-2 text-sm text-virel-errorText">{patError}</p>}

          {onPatSave && (
            <div className="mt-3">
              <Button
                type="button"
                onClick={onPatSave}
                disabled={isSavingPat || !formData.github_pat}
                className="btn-secondary"
              >
                {isSavingPat ? 'Saving...' : 'Save PAT'}
              </Button>
            </div>
          )}
        </div>
      </FormFieldGrid>
    </SectionDivider>
  );
}

export { GitHubSettingsSection };
export type { GitHubSettingsSectionProps };
