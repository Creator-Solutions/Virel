import { ArrowLeftIcon } from 'lucide-react';

import { DeploymentStatusBadge } from '@/src/components/atoms/deployment-status-badge';
import type { Deployment, DeploymentStatus } from '@/domains/projects/projects.types';

interface DeploymentDetailHeaderProps {
  projectId: string;
  deployment: Deployment;
  onNavigate: (path: string) => void;
}

function DeploymentDetailHeader({ projectId, deployment, onNavigate }: DeploymentDetailHeaderProps) {
  const deploymentNumber = deployment.id.split('_')[1] || deployment.id;

  return (
    <div>
      <button
        onClick={() => onNavigate(`home/projects/${projectId}/deployments`)}
        className="mb-4 flex items-center gap-2 text-sm text-virel-textSecondary transition-colors hover:text-virel-text"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Deployments
      </button>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
        <div className="flex items-center gap-4">
          <DeploymentStatusBadge status={deployment.status as DeploymentStatus} size="md" />
          <h1 className="text-2xl font-bold tracking-tight text-virel-text">Deployment #{deploymentNumber}</h1>
        </div>
      </div>
    </div>
  );
}

export { DeploymentDetailHeader };
export type { DeploymentDetailHeaderProps };
