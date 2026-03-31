import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Eye, EyeOff, Info } from 'lucide-react';

import { TextInput } from '@/src/components/atoms/text-input';
import { FormLabel } from '@/src/components/atoms/form-label';
import { FormError } from '@/src/components/atoms/form-error';
import { SectionDivider } from '@/src/components/atoms/section-divider';

interface CreateProjectFormProps {
  onCancel?: () => void;
  errors?: Record<string, string>;
}

function CreateProjectForm({ onCancel, errors = {} }: CreateProjectFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    public_url: '',
    deploy_path: '',
    github_owner: '',
    github_repo: '',
    github_branch: 'main',
    github_pat: '',
  });
  const [showPat, setShowPat] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    router.post('/home/projects/create', formData, {
      onError: () => {},
    });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-virel-text">Create Project</h1>
        <p className="mt-1 text-sm text-virel-textSecondary">Configure a new project for automated deployments.</p>
      </div>

      <form className="space-y-8">
        {/* General Section */}
        <section>
          <h2 className="mb-4 text-lg font-medium text-virel-text">General</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FormLabel htmlFor="name" className="mb-1 block">
                Project Name
              </FormLabel>
              <TextInput
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
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
                onChange={handleChange}
                placeholder="https://acme.com"
              />
              <FormError message={errors.public_url} />
            </div>
          </div>
        </section>

        {/* Deploy Path Section */}
        <SectionDivider heading="Deploy Path">
          <div>
            <FormLabel htmlFor="deploy_path" className="mb-1 block">
              Absolute Server Path
            </FormLabel>
            <TextInput
              id="deploy_path"
              name="deploy_path"
              value={formData.deploy_path}
              onChange={handleChange}
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

        {/* GitHub Section */}
        <SectionDivider heading="GitHub Repository">
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FormLabel htmlFor="github_owner" className="mb-1 block">
                Owner / Organization
              </FormLabel>
              <TextInput
                id="github_owner"
                name="github_owner"
                value={formData.github_owner}
                onChange={handleChange}
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
                onChange={handleChange}
                placeholder="e.g. marketing-site"
              />
              <FormError message={errors.github_repo} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FormLabel htmlFor="github_branch" className="mb-1 block">
                Branch
              </FormLabel>
              <TextInput
                id="github_branch"
                name="github_branch"
                value={formData.github_branch}
                onChange={handleChange}
                placeholder="main"
              />
              <FormError message={errors.github_branch} />
            </div>
            <div>
              <FormLabel htmlFor="github_pat" className="mb-1 block">
                Personal Access Token
              </FormLabel>
              <div className="relative">
                <TextInput
                  id="github_pat"
                  name="github_pat"
                  type={showPat ? 'text' : 'password'}
                  value={formData.github_pat}
                  onChange={handleChange}
                  className="pr-10"
                  placeholder="ghp_..."
                />
                <button
                  type="button"
                  onClick={() => setShowPat(!showPat)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-virel-textMuted hover:text-virel-text"
                >
                  {showPat ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-2 text-sm text-virel-textSecondary">
                Personal access token. Required scopes: <span className="font-mono text-xs">repo</span>
              </p>
              <FormError message={errors.github_pat} />
            </div>
          </div>
        </SectionDivider>

        {/* Webhook Section */}
        <SectionDivider heading="Webhook">
          <div className="flex gap-3 rounded-md border border-virel-border bg-virel-surface p-4">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-virel-textSecondary" />
            <p className="text-sm text-virel-textSecondary">
              A webhook secret will be auto-generated after project creation. You can then add it to your GitHub
              repository settings to enable automatic deployments on push.
            </p>
          </div>
        </SectionDivider>

        <div className="flex justify-end gap-3 border-t border-virel-border pt-6">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className="btn-primary">
            Create Project
          </button>
        </div>
      </form>
    </div>
  );
}

export { CreateProjectForm };
export type { CreateProjectFormProps };
