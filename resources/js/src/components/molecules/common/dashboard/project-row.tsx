import { GitBranch } from 'lucide-react';
import { Link } from '@inertiajs/react';
import type { Project } from '@/src/domains/dashboard/dashboard.types';
import { TableCell } from '@/src/components/atoms/table';
import { StatusBadge } from './status-badge';

interface ProjectRowProps {
  project: Project;
}

function formatDate(dateString: string | null): string {
  if (!dateString) {
    return '-';
  }

  const date = new Date(dateString);

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function ProjectRow({ project }: ProjectRowProps) {
  const status = project.latest_deployment?.status ?? 'never';

  return (
    <tr className="group border-b border-virel-border transition-colors hover:bg-virel-surface/50">
      <TableCell className="py-3 pl-4">
        <div className="flex flex-col">
          <span className="font-medium text-virel-text">{project.name}</span>
          <span className="flex items-center gap-1 text-xs text-virel-textMuted">
            <GitBranch className="h-3 w-3" />
            {project.github_owner}/{project.github_repo}
            <span className="text-virel-textSecondary">({project.github_branch})</span>
          </span>
        </div>
      </TableCell>
      <TableCell className="text-virel-text">
        <StatusBadge status={status} />
      </TableCell>
      <TableCell className="text-virel-text">{formatDate(project.latest_deployment?.created_at ?? null)}</TableCell>
      <TableCell className="pr-4">
        <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Link
            href={`/home/projects/${project.id}`}
            className="text-sm text-virel-textSecondary hover:text-virel-text"
          >
            View
          </Link>
        </div>
      </TableCell>
    </tr>
  );
}

export { ProjectRow };
export type { ProjectRowProps };
