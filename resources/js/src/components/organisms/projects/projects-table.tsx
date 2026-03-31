import { Settings, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/src/components/atoms/button';
import { EmptyState } from '@/src/components/atoms/empty-state';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/src/components/atoms/table';
import { Pagination } from '@/src/components/atoms/pagination';
import { Skeleton } from '@/src/components/atoms/skeleton';
import { ProjectStatusBadge } from '@/src/components/molecules/projects/project-status-badge';
import { MonoText } from '@/src/components/atoms/mono-text';
import type { Project, PaginatedResponse } from '@/domains/projects/projects.types';
import { formatRelativeTime } from '@/lib/utils';

interface ProjectsTableProps {
  projects: PaginatedResponse<Project>;
  onNavigate: (path: string) => void;
  onDelete: (project: Project) => void;
  isLoading?: boolean;
}

function ProjectsTable({ projects, onNavigate, onDelete, isLoading }: ProjectsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-virel-border bg-virel-surface">
        <div className="border-b border-virel-border px-4 py-3">
          <Skeleton className="h-6 w-32" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-virel-border px-4 py-4 last:border-b-0">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="ml-auto h-6 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (projects.data.length === 0) {
    return (
      <div className="rounded-lg border border-virel-border bg-virel-surface">
        <EmptyState
          title="No projects yet"
          description="Get started by creating your first project."
          action={{
            label: 'Create Project',
            onClick: () => onNavigate('/home/projects/create'),
          }}
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-virel-border bg-virel-surface">
      <Table>
        <TableHeader>
          <TableRow className="border-virel-border hover:bg-transparent">
            <TableHead className="w-[120px] pl-4 text-virel-textSecondary">Name</TableHead>
            <TableHead className="w-[80px] text-virel-textSecondary">Deploy Path</TableHead>
            <TableHead className="w-[80px] text-virel-textSecondary">Repo</TableHead>
            <TableHead className="w-[80px] text-virel-textSecondary">Branch</TableHead>
            <TableHead className="w-[90px] text-virel-textSecondary">Status</TableHead>
            <TableHead className="w-[100px] text-virel-textSecondary">Created</TableHead>
            <TableHead className="w-[100px] pr-4 text-virel-textSecondary">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.data.map((project) => (
            <TableRow key={project.id} className="group border-virel-border hover:bg-virel-base/50">
              <TableCell className="w-[200px] py-3 pl-4">
                <button
                  onClick={() => onNavigate(`projects/${project.id}`)}
                  className="font-medium text-virel-text hover:text-virel-accent transition-colors cursor-pointer"
                >
                  {project.name}
                </button>
              </TableCell>
              <TableCell className="w-[140px] overflow-hidden text-virel-text">
                <MonoText truncate>{project.deploy_path}</MonoText>
              </TableCell>
              <TableCell className="w-[140px] text-virel-text">
                <MonoText truncate>
                  {project.github_owner}/{project.github_repo}
                </MonoText>
              </TableCell>
              <TableCell className="w-[80px] text-virel-text">{project.github_branch}</TableCell>
              <TableCell className="w-[90px] text-virel-text">
                <ProjectStatusBadge isActive={project.is_active} />
              </TableCell>
              <TableCell className="w-[100px] text-virel-text">{formatRelativeTime(project.created_at)}</TableCell>
              <TableCell className="w-[100px] pr-4">
                <div className={cn('flex items-center gap-1 transition-opacity', 'opacity-0 group-hover:opacity-100')}>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onNavigate(`/home/projects/${project.id}`)}
                    className="rounded p-1.5 text-virel-textSecondary transition-colors hover:bg-virel-border hover:text-virel-text"
                  >
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onNavigate(`/home/projects/${project.id}/settings`)}
                    className="rounded p-1.5 text-virel-textSecondary transition-colors hover:bg-virel-border hover:text-virel-text"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDelete(project)}
                    className="rounded p-1.5 text-virel-textSecondary transition-colors hover:bg-virel-errorBg/20 hover:text-virel-errorText"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination
        currentPage={projects.current_page}
        lastPage={projects.last_page}
        onPageChange={(page) => onNavigate(`?page=${page}`)}
      />
    </div>
  );
}

export { ProjectsTable };
export type { ProjectsTableProps };
