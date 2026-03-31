export type DeploymentStatus = 'pending' | 'running' | 'success' | 'failed' | 'never';

export interface Deployment {
  id: string;
  status: DeploymentStatus;
  commit_sha: string | null;
  created_at: string | null;
  completed_at: string | null;
}

export interface Project {
  id: string;
  name: string;
  github_owner: string;
  github_repo: string;
  github_branch: string;
  public_url: string | null;
  is_active: boolean;
  created_at: string | null;
  latest_deployment: Deployment | null;
}

export interface DashboardStats {
  total_projects: number;
  active_deployments: number;
  successful: number;
  failed: number;
}

export interface DashboardData {
  stats: DashboardStats;
  projects: Project[];
}
