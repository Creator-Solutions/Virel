import { useState } from 'react';
import { router } from '@inertiajs/react';

import { Button } from '@/src/components/atoms/button';
import { PageHeader } from '@/src/components/molecules/common/page-header';
import { AlertBanner } from '@/src/components/molecules/alert-banner';
import { projectsService } from '@/domains/projects/projects.service';
import { GeneralSettingsSection } from './general-settings-section';
import { DeployPathSection } from './deploy-path-section';
import { GitHubSettingsSection } from './github-settings-section';
import { WebhookSetupSection } from './webhook-setup-section';
import { DangerZoneSection } from './danger-zone-section';
import type { Project } from '@/domains/projects/projects.types';

interface ProjectSettingsFormProps {
  project: Project;
  errors?: Record<string, string>;
}

function ProjectSettingsForm({ project, errors = {} }: ProjectSettingsFormProps) {
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
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPat, setIsSavingPat] = useState(false);
  const [patSaveMessage, setPatSaveMessage] = useState<string | null>(null);
  const [patError, setPatError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await projectsService.updateProject(project.id, formData);
      setNewSecret(null);
      router.reload();
    } catch (error) {
      console.error('Failed to update project:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePatSave = async () => {
    if (!formData.github_pat) {
      return;
    }

    setPatError(null);
    setPatSaveMessage(null);
    setIsSavingPat(true);

    try {
      const response = await projectsService.updateProject(project.id, { github_pat: formData.github_pat });
      setFormData((prev) => ({ ...prev, github_pat: '' }));

      if (response.github_setup_pending === false) {
        setPatSaveMessage('Project updated. GitHub integration setup has been triggered.');
      } else {
        setPatSaveMessage('PAT saved. GitHub setup will complete shortly.');
      }
    } catch (error: unknown) {
      if (error instanceof Error && 'message' in error) {
        setPatError(error.message);
      } else {
        setPatError('Failed to save PAT');
      }
    } finally {
      setIsSavingPat(false);
    }
  };

  const handleRegenerateSecret = async () => {
    setIsRegenerating(true);
    setRegenerateModalOpen(false);
    try {
      const response = await projectsService.regenerateWebhookSecret(project.id);
      setNewSecret(response.secret);
      router.reload();
    } catch (error) {
      console.error('Failed to regenerate secret:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await projectsService.deleteProject(project.id);
      router.visit('/home/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const webhookUrl = project.webhook_url || `/api/webhooks/${project.id}`;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Project Settings" description="Manage your project configuration and deployment settings." />

      <form className="space-y-8">
        <GeneralSettingsSection formData={formData} errors={errors} onChange={handleChange} />
        <DeployPathSection formData={formData} errors={errors} onChange={handleChange} />
        <GitHubSettingsSection
          formData={formData}
          errors={errors}
          onChange={handleChange}
          onPatSave={handlePatSave}
          isSavingPat={isSavingPat}
          patSaveMessage={patSaveMessage}
          patError={patError}
        />
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
          <Button type="button" onClick={handleSubmit} disabled={isSaving} className="btn-primary">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

export { ProjectSettingsForm };
export type { ProjectSettingsFormProps };
