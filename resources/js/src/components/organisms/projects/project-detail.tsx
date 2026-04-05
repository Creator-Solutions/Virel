import { ProjectDetailHeader } from '@/src/components/molecules/projects/project-detail-header';
import { LatestDeploymentCard } from '@/src/components/molecules/projects/latest-deployment-card';
import { RecentDeploymentsTable } from '@/src/components/molecules/projects/recent-deployments-table';
import { RecentArtifactsList } from '@/src/components/molecules/projects/recent-artifacts-list';
import type { ProjectDetail, Artifact } from '@/domains/projects/projects.types';

interface ProjectDetailProps {
  project: ProjectDetail;
  isDeploying: boolean;
  onDeploy: () => void;
  onRollback: (artifact: Artifact) => void;
  onNavigate: (path: string) => void;
}

function ProjectDetail({ project, isDeploying, onDeploy, onRollback, onNavigate }: ProjectDetailProps) {
  return (
    <div className="space-y-8 mt-5">
      <ProjectDetailHeader project={project} isDeploying={isDeploying} onDeploy={onDeploy} onNavigate={onNavigate} />

      <section>
        <h2 className="mb-4 text-lg font-medium text-virel-text">Latest Deployment</h2>
        <LatestDeploymentCard
          deployment={project.latest_deployment}
          artifacts={project.recent_artifacts}
          onRollback={onRollback}
        />
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-virel-text">Recent Deployments</h2>
            <button
              onClick={() => onNavigate(`${project.id}/deployments`)}
              className="text-sm text-virel-textSecondary transition-colors hover:text-virel-text"
            >
              View all
            </button>
          </div>
          <RecentDeploymentsTable
            deployments={project.recent_deployments}
            projectId={project.id}
            onNavigate={onNavigate}
          />
        </section>

        <section className="lg:col-span-1">
          <h2 className="mb-4 text-lg font-medium text-virel-text">Recent Backups</h2>
          <RecentArtifactsList artifacts={project.recent_artifacts} onRollback={onRollback} />
        </section>
      </div>
    </div>
  );
}

export { ProjectDetail };
export type { ProjectDetailProps };
