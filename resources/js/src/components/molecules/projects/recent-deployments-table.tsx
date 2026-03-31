import { DeploymentStatusBadge } from '@/src/components/atoms/deployment-status-badge';
import { MonoText } from '@/src/components/atoms/mono-text';
import type { Deployment } from '@/domains/projects/projects.types';
import { formatRelativeTime, formatDuration } from '@/lib/utils';

interface RecentDeploymentsTableProps {
  deployments: Deployment[];
  projectId: string;
  onNavigate: (path: string) => void;
}

function RecentDeploymentsTable({ deployments, projectId, onNavigate }: RecentDeploymentsTableProps) {
  if (deployments.length === 0) {
    return (
      <div className="overflow-hidden rounded-lg border border-virel-border bg-virel-surface">
        <div className="p-6 text-center text-sm text-virel-textMuted">No deployments yet.</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-virel-border bg-virel-surface">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-virel-border bg-virel-base text-xs text-virel-textSecondary uppercase">
          <tr>
            <th className="px-6 py-3 font-medium">Status</th>
            <th className="px-6 py-3 font-medium">Commit</th>
            <th className="px-6 py-3 font-medium">Trigger</th>
            <th className="px-6 py-3 font-medium">Duration</th>
            <th className="px-6 py-3 font-medium">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-virel-border">
          {deployments.map((deployment) => (
            <tr
              key={deployment.id}
              onClick={() => onNavigate(`/home/projects/${projectId}/deployments/${deployment.id}`)}
              className="cursor-pointer transition-colors hover:bg-virel-base/50"
            >
              <td className="px-6 py-4">
                <DeploymentStatusBadge status={deployment.status} size="sm" />
              </td>
              <td className="px-6 py-4">
                <MonoText className='text-virel-text'>{deployment.commit_sha ? deployment.commit_sha.slice(0, 7) : '—'}</MonoText>
              </td>
              <td className="px-6 py-4 text-virel-text capitalize">{deployment.trigger}</td>
              <td className="px-6 py-4 text-virel-text">
                {formatDuration(deployment.started_at, deployment.completed_at)}
              </td>
              <td className="px-6 py-4 text-virel-textSecondary">{formatRelativeTime(deployment.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { RecentDeploymentsTable };
export type { RecentDeploymentsTableProps };
