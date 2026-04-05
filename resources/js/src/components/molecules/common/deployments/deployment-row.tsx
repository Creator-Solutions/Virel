import { GitBranchIcon } from 'lucide-react';

import { DeploymentStatusBadge } from '@/src/components/atoms/deployment-status-badge';
import { MonoText } from '@/src/components/atoms/mono-text';
import type { Deployment } from '@/domains/deployments/deployments.types';

interface DeploymentRowProps {
  deployment: Deployment;
  projectId: string;
  onNavigate: (path: string) => void;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffSecs / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
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

function DeploymentRow({ deployment, projectId, onNavigate }: DeploymentRowProps) {
  return (
    <tr
      onClick={() => onNavigate(`home/projects/${projectId}/deployments/${deployment.id}`)}
      className="group cursor-pointer transition-colors hover:bg-virel-elevated"
    >
      <td className="px-4 py-3">
        <DeploymentStatusBadge status={deployment.status} />
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center rounded border border-virel-border bg-virel-base px-2 py-0.5 text-xs font-medium text-virel-textSecondary capitalize">
          {deployment.trigger}
        </span>
      </td>
      <td className="px-4 py-3">
        {deployment.commit_sha ? (
          <MonoText truncate className="text-virel-text">
            {deployment.commit_sha.substring(0, 7)}
          </MonoText>
        ) : (
          <span className="text-virel-textMuted">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {deployment.branch ? (
          <div className="flex items-center gap-1.5 text-virel-text">
            <GitBranchIcon className="h-3.5 w-3.5 text-virel-textMuted" />
            <span>{deployment.branch}</span>
          </div>
        ) : (
          <span className="text-virel-textMuted">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-virel-textSecondary">
        {deployment.triggered_by ? deployment.triggered_by.name : 'Webhook'}
      </td>
      <td className="px-4 py-3 text-virel-textSecondary">
        {formatDuration(deployment.started_at, deployment.completed_at)}
      </td>
      <td className="px-4 py-3 text-virel-textSecondary">
        <span title={new Date(deployment.created_at).toLocaleString()}>
          {formatRelativeTime(deployment.created_at)}
        </span>
      </td>
    </tr>
  );
}

export { DeploymentRow };
export type { DeploymentRowProps };
