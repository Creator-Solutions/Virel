import { useEffect, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';

import { useProjectsStore } from '@/store/projects.store';
import { projectsService } from '@/domains/projects/projects.service';
import type { Project, PaginatedResponse } from '@/domains/projects/projects.types';
import { PageHeader } from '@/src/components/molecules';
import { ProjectsTable } from '@/src/components/organisms/projects';
import { ConfirmModal } from '@/src/components/atoms/confirm-modal';
import HomeLayout from '..';

interface ProjectsPageProps {
  projects: PaginatedResponse<Project>;
}

const Projects = () => {
  const { projects, isLoading, setProjects, setLoading } = useProjectsStore();
  const pageProps = usePage().props as unknown as ProjectsPageProps;
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    project: Project | null;
  }>({ open: false, project: null });

  useEffect(() => {
    if (pageProps.projects) {
        setProjects(pageProps.projects);
    }
  }, [pageProps.projects]);

  const handleNavigate = (path: string) => {
    router.visit(path);
  };

  const handleDelete = (project: Project) => {
    setDeleteModal({ open: true, project });
  };

  const confirmDelete = async () => {
    if (deleteModal.project) {
      setLoading(true);

      try {
        await projectsService.deleteProject(deleteModal.project.id);
        router.reload();
      } finally {
        setLoading(false);
        setDeleteModal({ open: false, project: null });
      }
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, project: null });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Projects"
        description="Manage your deployed applications and their configurations."
        action={
          <Link href="/home/projects/create" className="btn-primary">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Project
          </Link>
        }
      />
      <ProjectsTable projects={projects} onNavigate={handleNavigate} onDelete={handleDelete} isLoading={isLoading} />
      <ConfirmModal
        open={deleteModal.open}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Project"
        description={
          deleteModal.project
            ? `Are you sure you want to delete "${deleteModal.project.name}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

Projects.layout = (page: React.ReactNode) => <HomeLayout>{page}</HomeLayout>;

export default Projects;
