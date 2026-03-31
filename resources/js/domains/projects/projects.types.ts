export interface Project {
  id: string;
  user_id: string;
  name: string;
  deploy_path: string;
  public_url: string | null;
  github_owner: string;
  github_repo: string;
  github_branch: string;
  webhook_secret: string | null;
  webhook_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export type DeploymentStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
export type DeploymentTrigger = 'manual' | 'webhook' | 'api';

export interface DeploymentUser {
  id: string;
  name: string;
  email: string;
}

export interface Deployment {
  id: string;
  project_id: string;
  status: DeploymentStatus;
  trigger: DeploymentTrigger;
  branch: string | null;
  commit_sha: string | null;
  commit_message: string | null;
  triggered_by: DeploymentUser | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Artifact {
  id: string;
  deployment_id: string;
  project_id: string;
  file_path: string;
  file_size: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectDetail extends Project {
  latest_deployment: Deployment | null;
  recent_deployments: Deployment[];
  recent_artifacts: Artifact[];
  artifact_count: number;
}

export interface ProjectSettingsPayload {
  name: string;
  public_url: string | null;
  deploy_path: string;
  github_owner: string;
  github_repo: string;
  github_branch: string;
  github_pat: string | null;
}
