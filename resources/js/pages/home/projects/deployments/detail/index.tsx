import { useEffect, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { DeploymentDetailHeader } from '@/src/components/molecules/common/deployments/detail/deployment-detail-header';
import { DeploymentDetailMeta } from '@/src/components/organisms/common/deployments/detail/deployment-detail-meta';
import { ArtifactList } from '@/src/components/organisms/common/deployments/detail/artifact-list';
import { LogViewer } from '@/src/components/organisms/common/deployments/detail/log-viewer';
import { ConfirmModal } from '@/src/components/atoms/confirm-modal';
import { InfoBanner } from '@/src/components/atoms/info-banner';
import { Skeleton } from '@/src/components/atoms/skeleton';
import { projectsService } from '@/domains/projects/projects.service';
import type {
  DeploymentWithProject,
  Artifact,
  DeploymentStatus,
  Deployment,
} from '@/domains/projects/projects.types';
import HomeLayout from '../../..';

interface DeploymentDetailPageProps {
  projectId: string;
  deploymentId: string;
}

const DeploymentDetail = () => {
  const pageProps = usePage().props as unknown as DeploymentDetailPageProps;
  const projectId = pageProps.projectId;
  const deploymentId = pageProps.deploymentId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deploymentData, setDeploymentData] = useState<DeploymentWithProject | null>(null);
  const [log, setLog] = useState<string | null>(null);
  const [logError, setLogError] = useState(false);

  const [rollbackModalOpen, setRollbackModalOpen] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const deploymentResponse = await projectsService.getDeployment(projectId, deploymentId);
        setDeploymentData(deploymentResponse.data);

        if (deploymentResponse.data.status === 'success' || deploymentResponse.data.status === 'failed') {
          try {
            const logResponse = await projectsService.getDeploymentLog(projectId, deploymentId);
            setLog(logResponse.log);
          } catch {
            setLogError(true);
          }
        }
      } catch (err) {
        setError('Failed to load deployment data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, deploymentId]);

  const handleNavigate = (path: string) => {
    router.visit(`/${path}`);
  };

  const handleRollbackClick = (artifact: Artifact) => {
    setSelectedArtifact(artifact);
    setRollbackModalOpen(true);
  };

  const confirmRollback = async () => {
    if (!selectedArtifact || !deploymentData) {
      return;
    }

    await projectsService.rollbackToArtifactApi(deploymentData.project.id, selectedArtifact.id);
    setRollbackModalOpen(false);
    setSelectedArtifact(null);
    router.visit(`/home/projects/${deploymentData.project.id}/deployments`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="mb-8 h-12 w-64" />
        <Skeleton className="mb-8 h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !deploymentData) {
    return (
      <div className="p-6">
        <InfoBanner>{error || 'Deployment not found'}</InfoBanner>
      </div>
    );
  }

  const project = deploymentData.project;
  const deployment = deploymentData as unknown as Deployment;
  const status = deployment.status as DeploymentStatus;
  const isComplete = status === 'success' || status === 'failed';

  return (
    <div className="p-6">
      <div className="space-y-8">
        <DeploymentDetailHeader projectId={project.id} deployment={deployment} onNavigate={handleNavigate} />

        <DeploymentDetailMeta deployment={deployment} />

        <div>
          <h2 className="mb-4 text-lg font-semibold text-virel-text">Available Artifacts</h2>
          <ArtifactList artifacts={[]} onRollback={handleRollbackClick} />
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-virel-text">Deployment Log</h2>

          {!isComplete && <InfoBanner>Deployment is in progress. Refresh the page to see the latest log.</InfoBanner>}

          {isComplete && log && <LogViewer logLines={log.split('\n')} />}

          {isComplete && !log && logError && <InfoBanner>Log file is not available for this deployment.</InfoBanner>}
        </div>

        <ConfirmModal
          open={rollbackModalOpen}
          onClose={() => setRollbackModalOpen(false)}
          onConfirm={confirmRollback}
          title="Confirm Rollback"
          description="This will restore the project to the state captured in this backup. Current files will be overwritten."
          confirmLabel="Rollback"
          variant="danger"
        />
      </div>
    </div>
  );
};

DeploymentDetail.layout = (page: ReactNode) => <HomeLayout>{page}</HomeLayout>;

export default DeploymentDetail;
