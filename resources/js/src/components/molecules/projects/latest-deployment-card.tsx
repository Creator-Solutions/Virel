import { RotateCcw } from 'lucide-react';

import { StatusBadge } from '@/src/components/molecules/common/dashboard/status-badge';
import { MonoText } from '@/src/components/atoms/mono-text';
import type { Deployment, Artifact } from '@/domains/projects/projects.types';
import { formatRelativeTime } from '@/lib/utils';

interface LatestDeploymentCardProps {
  deployment: Deployment | null;
  artifacts?: Artifact[];
  onRollback?: (artifact: Artifact) => void;
}

function LatestDeploymentCard({ deployment, artifacts = [], onRollback }: LatestDeploymentCardProps) {
  if (!deployment) {
    return (
      <div className="rounded-lg border border-virel-border bg-virel-surface p-6">
        <div className="text-sm text-virel-textMuted">No deployments yet</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-virel-border bg-virel-surface p-6">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <StatusBadge status={deployment.status} size="md" />

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm sm:grid-cols-4">
            <div>
              <div className="mb-1 text-xs tracking-wider text-virel-textMuted uppercase">Commit</div>
              <MonoText copyable copyValue={deployment.commit_sha || ''} className='text-virel-text'>
                {deployment.commit_sha?.substring(0, 7) || 'N/A'}
              </MonoText>
            </div>
            <div>
              <div className="mb-1 text-xs tracking-wider text-virel-textMuted uppercase">Branch</div>
              <div className="font-medium text-virel-text">{deployment.branch || 'N/A'}</div>
            </div>
            <div>
              <div className="mb-1 text-xs tracking-wider text-virel-textMuted uppercase">Triggered By</div>
              <div className="text-virel-text">
                {deployment.trigger === 'webhook' ? 'via webhook' : deployment.triggered_by?.name || 'Unknown'}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs tracking-wider text-virel-textMuted uppercase">Time</div>
              <div className="text-virel-text" title={deployment.created_at}>
                {formatRelativeTime(deployment.created_at)}
              </div>
            </div>
          </div>
        </div>

        {deployment.status === 'success' && artifacts.length > 0 && (
          <button onClick={() => onRollback?.(artifacts[0])} className="btn-primary whitespace-nowrap">
            <RotateCcw className="mr-2 h-4 w-4" />
            Rollback
          </button>
        )}
      </div>
    </div>
  );
}

export { LatestDeploymentCard };
export type { LatestDeploymentCardProps };
