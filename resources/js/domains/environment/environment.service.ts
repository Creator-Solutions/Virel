import type { EnvVariable, EnvVariableInput, EnvVariablesResponse } from './environment.types';

const API_BASE = '/api/v1';

class EnvironmentService {
  async getEnvVars(projectId: string): Promise<EnvVariable[]> {
    const response = await fetch(`${API_BASE}/projects/${projectId}/env-vars`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch environment variables');
    }

    const data: EnvVariablesResponse = await response.json();
    
    return data.data;
  }

  async createEnvVar(projectId: string, input: EnvVariableInput): Promise<EnvVariable> {
    const response = await fetch(`${API_BASE}/projects/${projectId}/env-vars`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();

      throw new Error(error.message || 'Failed to create environment variable');
    }

    const data = await response.json();

    return data.data;
  }

  async updateEnvVar(projectId: string, variableId: string, value: string): Promise<EnvVariable> {
    const response = await fetch(`${API_BASE}/projects/${projectId}/env-vars/${variableId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ value }),
    });

    if (!response.ok) {
      const error = await response.json();

      throw new Error(error.message || 'Failed to update environment variable');
    }

    const data = await response.json();

    return data.data;
  }

  async deleteEnvVar(projectId: string, variableId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/projects/${projectId}/env-vars/${variableId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete environment variable');
    }
  }

  async uploadSqlFile(projectId: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('sql_file', file);

    const response = await fetch(`${API_BASE}/projects/${projectId}/sql-file`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();

      throw new Error(error.message || 'Failed to upload SQL file');
    }
  }

  async importDatabase(projectId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/projects/${projectId}/import-database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();

      throw new Error(error.message || 'Failed to import database');
    }
  }

  async getSqlFileStatus(projectId: string): Promise<{ uploaded: boolean; filename?: string; size?: number }> {
    const response = await fetch(`${API_BASE}/projects/${projectId}/sql-file`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return { uploaded: false };
    }

    return response.json();
  }
}

export const environmentService = new EnvironmentService();
