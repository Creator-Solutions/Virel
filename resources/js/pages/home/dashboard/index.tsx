import { Link, usePage } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';
import type { DashboardStats, Project } from '@/src/domains/dashboard/dashboard.types';
import { StatsGrid } from '@/src/components/organisms/common/dashboard/stats-grid';
import { ProjectsTable } from '@/src/components/organisms/common/dashboard/projects-table';
import { PageHeader } from '@/src/components/molecules';
import HomeLayout from '..';
import type { PaginatedResponse } from '@/domains/projects/projects.types';

interface DashboardPageProps {
  stats: DashboardStats;
  projects: PaginatedResponse<Project>;
}

const Dashboard = () => {
  const props = usePage().props as unknown as DashboardPageProps;
  const { stats, projects } = props;

  return (
    <div className="flex flex-col gap-6 overflow-hidden p-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your projects and deployments."
        action={
          <Link href="/home/projects/create" className="btn-primary">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Project
          </Link>
        }
      />

      <StatsGrid stats={stats} />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-virel-text">Recent Projects</h2>
        <ProjectsTable projects={projects} />
      </div>
    </div>
  );
};

Dashboard.layout = (page: React.ReactNode) => <HomeLayout>{page}</HomeLayout>;

export default Dashboard;
