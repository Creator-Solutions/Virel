import { FileQuestion } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from './button';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-virel-surface">
        <FileQuestion className="h-8 w-8 text-virel-textMuted" />
      </div>
      <h3 className="text-lg font-medium text-virel-text">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-virel-textSecondary">{description}</p>
      {action && (
        <div className="mt-6">
          <Button onClick={action.onClick}>{action.label}</Button>
        </div>
      )}
    </div>
  );
}

export { EmptyState };
export type { EmptyStateProps };
