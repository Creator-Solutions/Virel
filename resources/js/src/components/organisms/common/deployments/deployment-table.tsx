import { Pagination } from '@/src/components/atoms/pagination';
import { EmptyState } from '@/src/components/atoms/empty-state';
import { DeploymentRow } from '@/src/components/molecules/common/deployments/deployment-row';
import type { Deployment, PaginatedDeployments, FilterStatus } from '@/domains/deployments/deployments.types';

interface DeploymentTableProps {
  deployments: PaginatedDeployments;
  filter: FilterStatus;
  projectId: string;
  onNavigate: (path: string) => void;
}

function DeploymentTable({ deployments, filter, projectId, onNavigate }: DeploymentTableProps) {
  const filteredDeployments = deployments.data.filter((dep) => filter === 'all' || dep.status === filter);

  if (filteredDeployments.length === 0) {
    return (
      <EmptyState
        title={filter === 'all' ? 'No deployments yet' : `No ${filter} deployments found`}
        description={
          filter === 'all'
            ? 'Trigger a deploy to get started.'
            : `There are no deployments matching the "${filter}" status.`
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-virel-border bg-virel-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="border-b border-virel-border bg-virel-elevated text-virel-textSecondary">
            <tr>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Trigger</th>
              <th className="px-4 py-3 font-medium">Commit</th>
              <th className="px-4 py-3 font-medium">Branch</th>
              <th className="px-4 py-3 font-medium">Triggered by</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Created at</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-virel-border">
            {filteredDeployments.map((deployment) => (
              <DeploymentRow
                key={deployment.id}
                deployment={deployment}
                projectId={projectId}
                onNavigate={onNavigate}
              />
            ))}
          </tbody>
        </table>
      </div>
      {filteredDeployments.length > 0 && (
        <Pagination currentPage={deployments.current_page} lastPage={deployments.last_page} onPageChange={() => {}} />
      )}
    </div>
  );
}

export { DeploymentTable };
export type { DeploymentTableProps };
