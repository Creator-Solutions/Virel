import type { FilterStatus } from '@/domains/deployments/deployments.types';

interface FilterBarProps {
  activeFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
}

const filters: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Success', value: 'success' },
  { label: 'Failed', value: 'failed' },
  { label: 'Running', value: 'running' },
  { label: 'Pending', value: 'pending' },
];

function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b border-virel-border pb-2">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onFilterChange(f.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
            activeFilter === f.value
              ? 'border border-virel-border bg-virel-elevated text-virel-text'
              : 'border border-transparent text-virel-textSecondary hover:bg-virel-surface hover:text-virel-text'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

export { FilterBar };
export type { FilterBarProps };
