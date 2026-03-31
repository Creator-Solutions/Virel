import type { Project, PaginatedResponse, ProjectDetail, Deployment, Artifact } from './projects.types';

const BASE_URL = '/api/v1/projects';

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
};
