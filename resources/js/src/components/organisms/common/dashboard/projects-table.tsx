import type { PaginatedResponse } from '@/domains/projects/projects.types';
import type { Project } from '@/src/domains/dashboard/dashboard.types';
import { Table, TableHeader, TableBody, TableHead, TableRow } from '@/src/components/atoms/table';
import { ProjectRow } from '@/src/components/molecules/common/dashboard/project-row';
import { EmptyState } from '@/src/components/molecules/common/dashboard/empty-state';
import { Skeleton } from '@/src/components/atoms/skeleton';
import { Pagination } from '@/src/components/atoms/pagination';

interface ProjectsTableProps {
  projects: PaginatedResponse<Project>;
  isLoading?: boolean;
}

function ProjectsTable({ projects, isLoading }: ProjectsTableProps) {
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
          description="Get started by creating your first project. Connect your GitHub repository to start deploying."
          actionLabel="Create Project"
          actionHref="/home/projects/create"
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-virel-border bg-virel-surface">
      <Table>
        <TableHeader>
          <TableRow className="border-virel-border hover:bg-transparent">
            <TableHead className="w-[40%] pl-4 text-virel-textSecondary">Project</TableHead>
            <TableHead className="text-virel-textSecondary">Status</TableHead>
            <TableHead className="text-virel-textSecondary">Last Deployed</TableHead>
            <TableHead className="pr-4 text-virel-textSecondary">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.data.map((project: Project) => (
            <ProjectRow key={project.id} project={project} />
          ))}
        </TableBody>
      </Table>
      <Pagination
        currentPage={projects.current_page}
        lastPage={projects.last_page}
        onPageChange={(page) => (window.location.href = `?page=${page}`)}
      />
    </div>
  );
}

export { ProjectsTable };
export type { ProjectsTableProps };
