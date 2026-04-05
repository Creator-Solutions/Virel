import * as React from 'react';
import { router, usePage } from '@inertiajs/react';

import { CreateProjectForm } from '@/src/components/organisms/projects/create-project-form';
import HomeLayout from '@/pages/home';

interface PageProps {
  errors?: Record<string, string>;
  virel_url_configured?: boolean;
}

const CreateProject = () => {
  const { errors, virel_url_configured } = usePage().props as PageProps;
  const handleCancel = () => {
    router.visit('/home/projects');
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <CreateProjectForm onCancel={handleCancel} errors={errors} virel_url_configured={virel_url_configured} />
    </div>
  );
};

CreateProject.layout = (page: React.ReactNode) => <HomeLayout>{page}</HomeLayout>;

export default CreateProject;
