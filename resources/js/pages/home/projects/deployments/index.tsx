import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { DeploymentHistoryHeader } from '@/src/components/molecules/common/deployments/deployment-history-header';
import { FilterBar } from '@/src/components/molecules/common/deployments/filter-bar';
import { DeploymentTable } from '@/src/components/organisms/common/deployments/deployment-table';
import type { DeploymentHistoryPageProps, FilterStatus } from '@/domains/deployments/deployments.types';
import HomeLayout from '../..';

const Deployments = () => {
  const { project, deployments, filters } = usePage().props as unknown as DeploymentHistoryPageProps;
  const [filter, setFilter] = useState<FilterStatus>(filters.status || 'all');

  const handleNavigate = (path: string) => {
    router.visit(`/${path}`);
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        <DeploymentHistoryHeader projectId={project.id} onNavigate={handleNavigate} />
        <FilterBar activeFilter={filter} onFilterChange={setFilter} />
        <DeploymentTable deployments={deployments} filter={filter} projectId={project.id} onNavigate={handleNavigate} />
      </div>
    </div>
  );
};

Deployments.layout = (page: ReactNode) => <HomeLayout>{page}</HomeLayout>;

export default Deployments;
