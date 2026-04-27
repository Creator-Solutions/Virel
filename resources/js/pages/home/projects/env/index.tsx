import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Plus, Trash2, Edit2, Eye, EyeOff, X, Database, AlertCircle } from 'lucide-react';

import type { Project } from '@/domains/projects/projects.types';
import { environmentService } from '@/domains/environment/environment.service';
import type { EnvVariable } from '@/domains/environment/environment.types';
import { envVarInputSchema } from '@/domains/environment/environment.schema';
import { TextInput } from '@/src/components/atoms/text-input';
import { FormLabel } from '@/src/components/atoms/form-label';
import { FormError } from '@/src/components/atoms/form-error';
import { Button } from '@/src/components/atoms/button';
import { Skeleton } from '@/src/components/atoms/skeleton';
import HomeLayout from '../..';

interface EnvVarsPageProps {
  project: Project;
}

const REQUIRED_DB_VARS = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PREFIX'];

const EnvVarsPage = () => {
  const pageProps = usePage().props as unknown as EnvVarsPageProps;
  const { project } = pageProps;

  const [envVars, setEnvVars] = useState<EnvVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});

  const [newVar, setNewVar] = useState({ key: '', value: '' });

  useEffect(() => {
    loadEnvVars();
  }, [project.id]);

  const loadEnvVars = async () => {
    try {
      const data = await environmentService.getEnvVars(project.id);
      setEnvVars(data);
    } catch (error) {
      console.error('Failed to load env vars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const validation = envVarInputSchema.safeParse(newVar);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path) {
          fieldErrors[path as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      await environmentService.createEnvVar(project.id, newVar);
      setNewVar({ key: '', value: '' });
      setShowAddForm(false);
      loadEnvVars();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add variable';
      setErrors({ key: message });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string, value: string) => {
    setSaving(true);
    setErrors({});

    try {
      await environmentService.updateEnvVar(project.id, id, value);
      setEditingId(null);
      loadEnvVars();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update variable';
      setErrors({ value: message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this variable?')) {
      return;
    }

    try {
      await environmentService.deleteEnvVar(project.id, id);
      loadEnvVars();
    } catch (error) {
      console.error('Failed to delete env var:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="mb-8 h-12 w-64" />
        <Skeleton className="mb-4 h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const dbVars = REQUIRED_DB_VARS.map((key) => {
    const existing = envVars.find((v) => v.key === key);
    return { key, value: existing?.value || '', exists: !!existing };
  });

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-virel-text">Environment Variables</h1>
        <p className="mt-1 text-sm text-virel-textSecondary">Manage environment variables for {project.name}</p>
      </div>

      {project.framework_type === 'wordpress' && (
        <div className="mb-6 rounded-md border border-blue-500/30 bg-blue-500/10 p-4">
          <div className="flex items-start gap-3">
            <Database className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
            <div className="flex flex-col">
              <p className="text-sm font-medium text-blue-200">WordPress Database Configuration</p>
              <p className="mt-1 text-sm text-blue-200/80">
                Configure the following environment variables for your WordPress database connection:
              </p>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                {dbVars.map((v) => (
                  <div
                    key={v.key}
                    className={`flex items-center gap-2 rounded px-2 py-1 ${
                      v.exists ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}
                  >
                    <span className={`font-mono text-xs ${v.exists ? 'text-green-400' : 'text-red-400'}`}>{v.key}</span>
                    {v.exists ? (
                      <span className="text-green-400">✓</span>
                    ) : (
                      <AlertCircle className="h-3 w-3 text-red-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between border-b border-virel-border pb-4">
        <h2 className="text-lg font-medium text-virel-text">Variables</h2>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2" variant="default">
          <Plus className="h-4 w-4" />
          Add Variable
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-6 rounded-md border border-virel-border bg-virel-surface p-4">
          <h3 className="mb-4 text-sm font-medium text-virel-text">Add New Variable</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FormLabel htmlFor="newKey" className="mb-1 block">
                Key
              </FormLabel>
              <TextInput
                id="newKey"
                name="key"
                value={newVar.key}
                onChange={(e) => setNewVar({ ...newVar, key: e.target.value.toUpperCase() })}
                placeholder="MY_VARIABLE"
                className="font-mono uppercase"
              />
              <FormError message={errors.key} />
            </div>
            <div>
              <FormLabel htmlFor="newValue" className="mb-1 block">
                Value
              </FormLabel>
              <TextInput
                id="newValue"
                name="value"
                type="password"
                value={newVar.value}
                onChange={(e) => setNewVar({ ...newVar, value: e.target.value })}
                placeholder="Enter value"
              />
              <FormError message={errors.value} />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddForm(false);
                setNewVar({ key: '', value: '' });
                setErrors({});
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={saving}>
              {saving ? 'Saving...' : 'Add Variable'}
            </Button>
          </div>
        </div>
      )}

      {envVars.length === 0 ? (
        <div className="rounded-md border border-dashed border-virel-border p-8 text-center">
          <p className="text-sm text-virel-textMuted">No environment variables yet</p>
          <Button variant="secondary" onClick={() => setShowAddForm(true)} className="mt-4">
            Add your first variable
          </Button>
        </div>
      ) : (
        <div className="rounded-md border border-virel-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-virel-border bg-virel-surface">
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-virel-textMuted uppercase">
                  Key
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-virel-textMuted uppercase">
                  Value
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-virel-textMuted uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-virel-border">
              {envVars.map((envVar) => (
                <tr key={envVar.id} className="hover:bg-virel-surface">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <code className="text-sm text-virel-text">{envVar.key}</code>
                  </td>
                  <td className="px-4 py-3">
                    {editingId === envVar.id ? (
                      <div className="flex items-center gap-2">
                        <TextInput
                          name="editValue"
                          type="password"
                          defaultValue={envVar.value}
                          id={`edit-${envVar.id}`}
                          className="font-mono"
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            const input = document.getElementById(`edit-${envVar.id}`) as HTMLInputElement;
                            handleUpdate(envVar.id, input.value);
                          }}
                          disabled={saving}
                        >
                          Save
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm text-virel-textMuted">
                          {showValues[envVar.id] ? envVar.value : '••••••••'}
                        </code>
                        <button
                          type="button"
                          onClick={() => setShowValues({ ...showValues, [envVar.id]: !showValues[envVar.id] })}
                          className="text-virel-textMuted hover:text-virel-text"
                        >
                          {showValues[envVar.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(envVar.id)}
                        className="rounded p-1 text-virel-textMuted hover:bg-virel-surface hover:text-virel-text"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(envVar.id)}
                        className="rounded p-1 text-virel-textMuted hover:bg-red-500/10 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

EnvVarsPage.layout = (page: ReactNode) => <HomeLayout>{page}</HomeLayout>;

export default EnvVarsPage;
