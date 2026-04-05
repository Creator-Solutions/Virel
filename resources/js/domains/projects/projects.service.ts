import type {
  Project,
  PaginatedResponse,
  ProjectDetail,
  Deployment,
  DeploymentWithProject,
  Artifact,
  DeploymentStatus,
} from './projects.types';

const BASE_URL = '/home/projects';

function getCsrfToken(): string {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

  return match ? decodeURIComponent(match[1]) : '';
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-XSRF-TOKEN': getCsrfToken(),
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const projectsService = {
  async getProjects(page = 1): Promise<PaginatedResponse<Project>> {
    return request<PaginatedResponse<Project>>(`${BASE_URL}?page=${page}`);
  },

  async deleteProject(id: string): Promise<void> {
    await request<void>(`${BASE_URL}/${id}`, { method: 'DELETE' });
  },

  async getProject(id: string): Promise<ProjectDetail> {
    return request<ProjectDetail>(`${BASE_URL}/${id}`);
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    return request<Project>(`${BASE_URL}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async regenerateWebhookSecret(id: string): Promise<{ secret: string }> {
    return request<{ secret: string }>(`${BASE_URL}/${id}/regenerate-secret`, {
      method: 'POST',
    });
  },

  async deployProject(id: string): Promise<Deployment> {
    return request<Deployment>(`${BASE_URL}/${id}/deploy`, { method: 'POST' });
  },

  async rollbackToArtifact(projectId: string, artifactId: string): Promise<Deployment> {
    return request<Deployment>(`${BASE_URL}/${projectId}/rollback/${artifactId}`, { method: 'POST' });
  },

  async getRecentDeployments(projectId: string): Promise<Deployment[]> {
    return request<Deployment[]>(`${BASE_URL}/${projectId}/deployments?limit=5`);
  },

  async getRecentArtifacts(projectId: string): Promise<Artifact[]> {
    return request<Artifact[]>(`${BASE_URL}/${projectId}/artifacts?limit=5`);
  },

  async getDeployments(
    projectId: string,
    filters: { status?: DeploymentStatus; page?: number; per_page?: number } = {},
  ): Promise<PaginatedResponse<Deployment>> {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.per_page) params.set('per_page', String(filters.per_page));

    const queryString = params.toString();
    return request<PaginatedResponse<Deployment>>(
      `/api/projects/${projectId}/deployments${queryString ? `?${queryString}` : ''}`,
    );
  },

  async rollbackToArtifactApi(projectId: string, artifactId: string): Promise<{ deployment: Deployment }> {
    return request<{ deployment: Deployment }>(`/api/projects/${projectId}/artifacts/${artifactId}/rollback`, {
      method: 'POST',
    });
  },

  async getDeployment(projectId: string, deploymentId: string): Promise<{ data: DeploymentWithProject }> {
    return request<{ data: DeploymentWithProject }>(`${BASE_URL}/${projectId}/deployments/${deploymentId}/data`);
  },

  async getDeploymentLog(projectId: string, deploymentId: string): Promise<{ log: string }> {
    return request<{ log: string }>(`${BASE_URL}/${projectId}/deployments/${deploymentId}/log`);
  },
};
