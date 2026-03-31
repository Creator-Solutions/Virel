import { z } from 'zod';

// projects schemas
export const projectSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  deploy_path: z.string(),
  public_url: z.string().nullable(),
  github_owner: z.string(),
  github_repo: z.string(),
  github_branch: z.string(),
  webhook_secret: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ProjectSchema = z.infer<typeof projectSchema>;

export const deploymentSchema = z.object({
  id: z.string(),
  project_id: z.string(),
  status: z.enum(['pending', 'running', 'success', 'failed', 'cancelled']),
  trigger: z.enum(['manual', 'webhook', 'api']),
  branch: z.string().nullable(),
  commit_sha: z.string().nullable(),
  commit_message: z.string().nullable(),
  triggered_by: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    })
    .nullable(),
  started_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const artifactSchema = z.object({
  id: z.string(),
  deployment_id: z.string(),
  project_id: z.string(),
  file_path: z.string(),
  file_size: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type DeploymentSchema = z.infer<typeof deploymentSchema>;
export type ArtifactSchema = z.infer<typeof artifactSchema>;
