import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Eye, EyeOff, Info, AlertTriangle } from 'lucide-react';

import { TextInput } from '@/src/components/atoms/text-input';
import { FormLabel } from '@/src/components/atoms/form-label';
import { FormError } from '@/src/components/atoms/form-error';
import { SectionDivider } from '@/src/components/atoms/section-divider';
import { SelectField } from '@/src/components/molecules/select-field';

interface CreateProjectFormProps {
  onCancel?: () => void;
  errors?: Record<string, string>;
  virel_url_configured?: boolean;
}

const FRAMEWORK_OPTIONS = [
  { value: 'laravel', label: 'Laravel (PHP)' },
  { value: 'react-vite', label: 'React SPA (Vite)' },
  { value: 'wordpress', label: 'WordPress' },
];

function CreateProjectForm({ onCancel, errors = {}, virel_url_configured = true }: CreateProjectFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    public_url: '',
    deploy_path: '',
    github_owner: '',
    github_repo: '',
    github_branch: 'main',
    github_pat: '',
    framework_type: '',
    app_root_path: '',
    db_name: '',
    db_user: '',
    db_password: '',
    db_host: 'localhost',
    db_prefix: 'wp_',
  });
  const [showPat, setShowPat] = useState(false);
  const [showDbPassword, setShowDbPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'framework_type' && value !== 'laravel' ? { app_root_path: '' } : {}),
    }));
  };

  const handleSubmit = () => {
    router.post('/home/projects/create', formData, {
      onError: (errors) => {
        console.error('Project creation failed:', errors);
      },
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

        {/* Framework Section */}
        <SectionDivider heading="Framework">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField
              id="framework_type"
              name="framework_type"
              label="Framework Type"
              value={formData.framework_type}
              onChange={handleSelectChange}
              options={FRAMEWORK_OPTIONS}
              placeholder="Select a framework"
              error={errors.framework_type}
            />
            {formData.framework_type === 'laravel' && (
              <div>
                <FormLabel htmlFor="app_root_path" className="mb-1 block">
                  App Root Path
                </FormLabel>
                <TextInput
                  id="app_root_path"
                  name="app_root_path"
                  value={formData.app_root_path}
                  onChange={handleChange}
                  className="font-mono"
                  placeholder="/home/username"
                />
                <p className="mt-2 text-sm text-virel-textSecondary">
                  Absolute path one level above public_html, e.g.{' '}
                  <span className="font-mono text-xs">/home/username</span>
                </p>
                <FormError message={errors.app_root_path} />
              </div>
            )}
          </div>
        </SectionDivider>

        {formData.framework_type === 'wordpress' && (
          <SectionDivider heading="Database Configuration">
            <div className="mb-4 rounded-md border border-blue-500/30 bg-blue-500/10 p-4">
              <p className="text-sm text-blue-200">
                Enter your WordPress database credentials. These will be stored as encrypted environment variables.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FormLabel htmlFor="db_name" className="mb-1 block">
                  Database Name
                </FormLabel>
                <TextInput
                  id="db_name"
                  name="db_name"
                  value={formData.db_name}
                  onChange={handleChange}
                  placeholder="your_wordpress_db"
                />
                <FormError message={errors.db_name} />
              </div>
              <div>
                <FormLabel htmlFor="db_host" className="mb-1 block">
                  Database Host
                </FormLabel>
                <TextInput
                  id="db_host"
                  name="db_host"
                  value={formData.db_host}
                  onChange={handleChange}
                  placeholder="localhost"
                />
                <FormError message={errors.db_host} />
              </div>
              <div>
                <FormLabel htmlFor="db_user" className="mb-1 block">
                  Database User
                </FormLabel>
                <TextInput
                  id="db_user"
                  name="db_user"
                  value={formData.db_user}
                  onChange={handleChange}
                  placeholder="your_db_user"
                />
                <FormError message={errors.db_user} />
              </div>
              <div>
                <FormLabel htmlFor="db_password" className="mb-1 block">
                  Database Password
                </FormLabel>
                <div className="relative">
                  <TextInput
                    id="db_password"
                    name="db_password"
                    type={showDbPassword ? 'text' : 'password'}
                    value={formData.db_password}
                    onChange={handleChange}
                    placeholder="your_password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDbPassword(!showDbPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-virel-textMuted hover:text-virel-text"
                  >
                    {showDbPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FormError message={errors.db_password} />
              </div>
              <div className="sm:col-span-2">
                <FormLabel htmlFor="db_prefix" className="mb-1 block">
                  Table Prefix
                </FormLabel>
                <TextInput
                  id="db_prefix"
                  name="db_prefix"
                  value={formData.db_prefix}
                  onChange={handleChange}
                  placeholder="wp_"
                  className="w-32 font-mono"
                />
                <FormError message={errors.db_prefix} />
              </div>
            </div>
          </SectionDivider>
        )}

        {/* GitHub Section */}
        <SectionDivider heading="GitHub Repository">
          {!virel_url_configured && (
            <div className="mb-4 flex gap-3 rounded-md border border-yellow-500/30 bg-yellow-500/10 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400" />
              <div className="flex flex-col">
                <p className="text-sm text-yellow-200">
                  Instance URL not configured. GitHub webhook creation will be skipped.
                </p>
                <a
                  href="/home/settings"
                  className="mt-1 text-sm font-medium text-yellow-400 underline underline-offset-2 hover:text-yellow-300"
                >
                  Configure Instance URL in Settings →
                </a>
              </div>
            </div>
          )}

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
