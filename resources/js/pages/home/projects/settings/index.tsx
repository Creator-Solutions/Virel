import * as React from 'react';
import { usePage } from '@inertiajs/react';

import { ProjectSettingsForm } from '@/src/components/organisms/projects/settings/project-settings-form';
import { Skeleton } from '@/src/components/atoms/skeleton';
import type { Project } from '@/domains/projects/projects.types';
import HomeLayout from '../..';

interface ProjectSettingsPageProps {
  project: Project;
  errors?: Record<string, string>;
  success?: string;
}

const ProjectSettingsPage = () => {
  const { project, errors, success } = usePage().props as unknown as ProjectSettingsPageProps;

  if (!project) {
    return (
      <div className="p-6">
        <Skeleton className="mb-8 h-12 w-64" />
        <Skeleton className="mb-8 h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <ProjectSettingsForm project={project} errors={errors} success={success} />
    </div>
  );
};

ProjectSettingsPage.layout = (page: React.ReactNode) => <HomeLayout>{page}</HomeLayout>;

export default ProjectSettingsPage;
