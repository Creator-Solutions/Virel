import { useState } from 'react';
import { router } from '@inertiajs/react';

import { Button } from '@/src/components/atoms/button';
import { PageHeader } from '@/src/components/molecules/common/page-header';
import { AlertBanner } from '@/src/components/molecules/alert-banner';
import { GeneralSettingsSection } from './general-settings-section';
import { DeployPathSection } from './deploy-path-section';
import { GitHubSettingsSection } from './github-settings-section';
import { WebhookSetupSection } from './webhook-setup-section';
import { DangerZoneSection } from './danger-zone-section';
import type { Project } from '@/domains/projects/projects.types';

interface ProjectSettingsFormProps {
  project: Project;
  errors?: Record<string, string>;
  success?: string;
}

function ProjectSettingsForm({ project, errors = {}, success }: ProjectSettingsFormProps) {
  const [formData, setFormData] = useState({
    name: project.name || '',
    public_url: project.public_url || '',
    deploy_path: project.deploy_path || '',
    github_owner: project.github_owner || '',
    github_repo: project.github_repo || '',
    github_branch: project.github_branch || 'main',
    github_pat: '',
  });

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateModalOpen, setRegenerateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    router.patch(`/home/projects/${project.id}`, formData, {
      onSuccess: () => setNewSecret(null),
    });
  };

  const handleRegenerateSecret = () => {
    setIsRegenerating(true);
    setRegenerateModalOpen(false);
    router.post(
      `/home/projects/${project.id}/regenerate-secret`,
      {},
      {
        onFinish: () => setIsRegenerating(false),
        onSuccess: () => {
          setNewSecret('Secret regenerated successfully');
        },
      },
    );
  };

  const handleDelete = () => {
    router.delete(`/home/projects/${project.id}`, {
      onSuccess: () => {
        router.visit('/home/projects');
      },
    });
  };

  const webhookUrl = project.webhook_url || `/api/webhooks/${project.id}`;

  return (
    <div className="mx-auto max-w-3xl">
      {success && <AlertBanner variant="success">{success}</AlertBanner>}

      <PageHeader title="Project Settings" description="Manage your project configuration and deployment settings." />

      <form className="space-y-8">
        <GeneralSettingsSection formData={formData} errors={errors} onChange={handleChange} />
        <DeployPathSection formData={formData} errors={errors} onChange={handleChange} />
        <GitHubSettingsSection formData={formData} errors={errors} onChange={handleChange} />
        <WebhookSetupSection webhookUrl={webhookUrl} webhookSecret={project.webhook_secret} />
        <DangerZoneSection
          projectName={project.name}
          newSecret={newSecret}
          isRegenerating={isRegenerating}
          onRegenerate={() => setRegenerateModalOpen(true)}
          onDelete={() => setDeleteModalOpen(true)}
          onRegenerateConfirm={handleRegenerateSecret}
          onDeleteConfirm={handleDelete}
          regenerateModalOpen={regenerateModalOpen}
          deleteModalOpen={deleteModalOpen}
          onRegenerateModalClose={() => setRegenerateModalOpen(false)}
          onDeleteModalClose={() => setDeleteModalOpen(false)}
        />

        <div className="flex justify-end border-t border-virel-border pt-6">
          <Button type="button" onClick={handleSubmit} className="btn-primary">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

export { ProjectSettingsForm };
export type { ProjectSettingsFormProps };
