import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { router, usePage } from '@inertiajs/react';

import { useProjectDetailStore } from '@/store/projects.store';
import { projectsService } from '@/domains/projects/projects.service';
import type { ProjectDetail, Artifact } from '@/domains/projects/projects.types';
import { ProjectDetail as ProjectDetailOrganism } from '@/src/components/organisms/projects';
import { ConfirmModal } from '@/src/components/atoms/confirm-modal';
import { Skeleton } from '@/src/components/atoms/skeleton';
import HomeLayout from '../..';

interface ProjectDetailPageProps {
  project: ProjectDetail;
}

const ProjectDetailPage = () => {
  const { project, isDeploying, setProject, setDeploying } = useProjectDetailStore();
  const pageProps = usePage().props as unknown as ProjectDetailPageProps;
  const [rollbackModal, setRollbackModal] = useState<{ open: boolean; artifact: Artifact | null }>({
    open: false,
    artifact: null,
  });
  const [deployModal, setDeployModal] = useState(false);

  useEffect(() => {
    if (pageProps.project) {
      setProject(pageProps.project);
    }
  }, []);

  const handleDeploy = async () => {
    if (!project) {
      return;
    }
    
    setDeploying(true);
    setDeployModal(false);

    try {
      await projectsService.deployProject(project.id);
      router.reload();
    } finally {
      setDeploying(false);
    }
  };

  const handleRollback = async () => {
    if (!project || !rollbackModal.artifact) {
      return;
    }
    
    setRollbackModal({ open: false, artifact: null });

    try {
      await projectsService.rollbackToArtifact(project.id, rollbackModal.artifact.id);
      router.reload();
    } catch (error) {
      console.error('Rollback failed:', error);
    }
  };

  const handleNavigate = (path: string) => {
    router.visit(path);
  };

  const handleOpenRollback = (artifact: Artifact) => {
    setRollbackModal({ open: true, artifact });
  };

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
      <ProjectDetailOrganism
        project={project}
        isDeploying={isDeploying}
        onDeploy={() => setDeployModal(true)}
        onRollback={handleOpenRollback}
        onNavigate={handleNavigate}
      />

      <ConfirmModal
        open={deployModal}
        onClose={() => setDeployModal(false)}
        onConfirm={handleDeploy}
        title="Deploy Project"
        description={`Are you sure you want to deploy "${project.name}"? This will trigger a new deployment.`}
        confirmLabel="Deploy"
        variant="default"
      />

      <ConfirmModal
        open={rollbackModal.open}
        onClose={() => setRollbackModal({ open: false, artifact: null })}
        onConfirm={handleRollback}
        title="Restore Backup"
        description={
          rollbackModal.artifact
            ? `Are you sure you want to restore this backup? This will rollback to the artifact from ${new Date(rollbackModal.artifact.created_at).toLocaleDateString()}.`
            : ''
        }
        confirmLabel="Restore"
        variant="danger"
      />
    </div>
  );
};

ProjectDetailPage.layout = (page: ReactNode) => <HomeLayout>{page}</HomeLayout>;

export default ProjectDetailPage;
