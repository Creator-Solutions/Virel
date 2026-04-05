import { PlayCircleIcon, GitBranchIcon, UserIcon, ClockIcon } from 'lucide-react';

import { MetadataItem } from '@/src/components/molecules/common/deployments/detail/metadata-item';
import { MonoText } from '@/src/components/atoms/mono-text';
import type { Deployment } from '@/domains/projects/projects.types';

interface DeploymentDetailMetaProps {
  deployment: Deployment;
}

function formatFullDate(dateString: string | null): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(startedAt: string | null, completedAt: string | null): string {
  if (!startedAt || !completedAt) return '—';

  const start = new Date(startedAt);
  const end = new Date(completedAt);
  const diffMs = end.getTime() - start.getTime();

  const minutes = Math.floor(diffMs / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function DeploymentDetailMeta({ deployment }: DeploymentDetailMetaProps) {
  return (
    <div className="rounded-lg border border-virel-border bg-virel-surface p-6">
      <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
        <MetadataItem icon={<PlayCircleIcon className="h-4 w-4" />} label="Trigger" value={deployment.trigger} />
        <MetadataItem
          icon={<GitBranchIcon className="h-4 w-4" />}
          label="Commit"
          value={
            deployment.commit_sha ? (
              <MonoText copyable>{deployment.commit_sha}</MonoText>
            ) : (
              <span className="text-virel-textMuted">—</span>
            )
          }
        />
        <MetadataItem icon={<GitBranchIcon className="h-4 w-4" />} label="Branch" value={deployment.branch || '—'} />
        <MetadataItem
          icon={<UserIcon className="h-4 w-4" />}
          label="Triggered by"
          value={deployment.triggered_by ? deployment.triggered_by.name : 'Webhook'}
        />
        <MetadataItem
          icon={<ClockIcon className="h-4 w-4" />}
          label="Started at"
          value={formatFullDate(deployment.started_at)}
        />
        <MetadataItem
          icon={<ClockIcon className="h-4 w-4" />}
          label="Completed at"
          value={
            deployment.completed_at
              ? formatFullDate(deployment.completed_at)
              : deployment.status === 'running'
                ? 'In progress...'
                : '—'
          }
        />
        <MetadataItem
          icon={<ClockIcon className="h-4 w-4" />}
          label="Duration"
          value={formatDuration(deployment.started_at, deployment.completed_at)}
        />
      </div>
    </div>
  );
}

export { DeploymentDetailMeta };
export type { DeploymentDetailMetaProps };
