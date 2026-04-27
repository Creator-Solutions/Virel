import * as React from 'react';

import { Button } from '@/src/components/atoms/button';

interface EnvVariableFilterProps {
  value: string;
  onChange: (value: string) => void;
  canManage: boolean;
  onAdd: () => void;
}

const environmentOptions = [
  { value: 'all', label: 'All Environments' },
  { value: 'development', label: 'Development' },
  { value: 'staging', label: 'Staging' },
  { value: 'production', label: 'Production' },
];

function EnvVariableFilter({ value, onChange, canManage, onAdd }: EnvVariableFilterProps) {
  return (
    <div className="flex items-center justify-between">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-44 input-field rounded-md border border-virel-border bg-virel-surface px-3 py-2 text-sm text-virel-text"
      >
        {environmentOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {canManage && <Button onClick={onAdd}>Add Variable</Button>}
    </div>
  );
}

export { EnvVariableFilter };
export type { EnvVariableFilterProps };
