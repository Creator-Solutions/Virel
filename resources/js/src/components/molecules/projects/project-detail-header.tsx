import { Play, GitBranch, Settings, ExternalLink } from 'lucide-react';

import { Button } from '@/src/components/atoms/button';
import { Spinner } from '@/src/components/atoms/spinner';
import { MonoText } from '@/src/components/atoms/mono-text';
import type { Project } from '@/domains/projects/projects.types';

interface ProjectDetailHeaderProps {
  project: Project;
  isDeploying: boolean;
  onDeploy: () => void;
  onNavigate: (path: string) => void;
}

function ProjectDetailHeader({ project, isDeploying, onDeploy, onNavigate }: ProjectDetailHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-virel-text">{project.name}</h1>
          <div className="flex items-center gap-1.5 rounded-full border border-virel-border bg-virel-surface px-2 py-1 text-xs font-medium">
            <span
              className={`h-2 w-2 rounded-full ${project.is_active ? 'bg-virel-successText' : 'bg-virel-textMuted'}`}
            />
            <span className="text-virel-textSecondary">{project.is_active ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 text-sm text-virel-textSecondary sm:flex-row sm:items-center sm:gap-6">
          {project.public_url && (
            <a
              href={project.public_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 transition-colors hover:text-virel-text"
            >
              <ExternalLink className="h-4 w-4" />
              <span>{project.public_url}</span>
            </a>
          )}
          <div className="flex items-center gap-1">
            <GitBranch className="h-4 w-4" />
            <MonoText>
              {project.github_owner}/{project.github_repo}
            </MonoText>
            <span className="text-virel-textMuted">({project.github_branch})</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={onDeploy} disabled={isDeploying} className="text-virel-black cursor-pointer bg-white">
          {isDeploying ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Deploying...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Deploy Now
            </>
          )}
        </Button>
        <Button variant="outline" onClick={() => onNavigate(`${project.id}/deployments`)}>
          View History
        </Button>
        <Button
          size="icon-sm"
          onClick={() => onNavigate(`${project.id}/settings`)}
          className="cursor-pointer"
        >
          <Settings className="h-4 w-4 text-virel-text" />
        </Button>
      </div>
    </div>
  );
}

export { ProjectDetailHeader };
export type { ProjectDetailHeaderProps };
