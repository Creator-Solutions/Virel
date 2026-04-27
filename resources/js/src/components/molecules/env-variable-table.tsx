import * as React from 'react';

import { InfoBanner } from '@/src/components/atoms/info-banner';
import type { EnvironmentVariable } from '@/domains/environment/environment.types';

interface EnvVariableTableProps {
  variables: EnvironmentVariable[];
  revealedValues: Record<string, string>;
  confirmingDelete: string | null;
  canManage: boolean;
  onReveal: (id: string) => void;
  onEdit: (variable: EnvironmentVariable) => void;
  onDelete: (id: string) => void;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
  getEnvironmentBadge: (env: string) => string;
}

function EnvVariableTable({
  variables,
  revealedValues,
  confirmingDelete,
  canManage,
  onReveal,
  onEdit,
  onDelete,
  onConfirmDelete,
  onCancelDelete,
  getEnvironmentBadge,
}: EnvVariableTableProps) {
  if (variables.length === 0) {
    return <InfoBanner>No environment variables yet. Add one to get started.</InfoBanner>;
  }

  return (
    <div className="overflow-hidden rounded-md border border-virel-border">
      <table className="min-w-full">
        <thead className="bg-virel-surface">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-virel-textSecondary">Key</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-virel-textSecondary">Value</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-virel-textSecondary">Environment</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-virel-textSecondary">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-virel-border bg-virel-base">
          {variables.map((variable) => (
            <tr key={variable.id}>
              <td className="px-4 py-3 text-sm font-medium whitespace-nowrap text-virel-text">{variable.key}</td>
              <td className="px-4 py-3 font-mono text-sm text-virel-textSecondary">
                {revealedValues[variable.id] ? (
                  revealedValues[variable.id]
                ) : variable.value === '****DECRYPTION_ERROR****' ? (
                  <span className="text-xs text-red-400">Decryption failed</span>
                ) : (
                  '••••••••'
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-md px-2 py-1 text-xs font-medium ${getEnvironmentBadge(variable.environment)}`}
                >
                  {variable.environment}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onReveal(variable.id)}
                  className="mr-2 text-sm text-virel-textSecondary hover:text-virel-text"
                >
                  {revealedValues[variable.id] ? 'Hide' : 'Reveal'}
                </button>
                {canManage && (
                  <>
                    <button
                      onClick={() => onEdit(variable)}
                      className="mr-2 text-sm text-virel-textSecondary hover:text-virel-text"
                    >
                      Edit
                    </button>
                    {confirmingDelete === variable.id ? (
                      <span className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onDelete(variable.id)}
                          className="mr-1 text-sm font-medium text-red-400 hover:text-red-300"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={onCancelDelete}
                          className="text-sm text-virel-textSecondary hover:text-virel-text"
                        >
                          Cancel
                        </button>
                      </span>
                    ) : (
                      <button onClick={() => onDelete(variable.id)} className="text-sm text-red-400 hover:text-red-300">
                        Delete
                      </button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { EnvVariableTable };
export type { EnvVariableTableProps };
