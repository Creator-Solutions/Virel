export type DeploymentStatus = 'success' | 'failed' | 'running' | 'pending';
export type DeploymentTrigger = 'manual' | 'webhook' | 'api';

export interface DeploymentUser {
  id: string;
  name: string;
}

export interface Deployment {
  id: string;
  project_id: string;
  status: DeploymentStatus;
  trigger: DeploymentTrigger;
  branch: string | null;
  commit_sha: string | null;
  triggered_by: DeploymentUser | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedDeployments {
  data: Deployment[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface DeploymentHistoryPageProps {
  project: {
    id: string;
    name: string;
  };
  deployments: PaginatedDeployments;
  filters: {
    status?: DeploymentStatus;
  };
}

export type FilterStatus = DeploymentStatus | 'all';
