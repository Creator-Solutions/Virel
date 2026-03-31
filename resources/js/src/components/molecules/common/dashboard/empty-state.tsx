import { FileQuestion } from 'lucide-react';
import { Button } from '@/src/components/atoms/button';
import { Link } from '@inertiajs/react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

function EmptyState({ title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-virel-surface">
        <FileQuestion className="h-8 w-8 text-virel-textMuted" />
      </div>
      <h3 className="text-lg font-medium text-virel-text">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-virel-textSecondary">{description}</p>
      {(actionLabel && actionHref) || onAction ? (
        <div className="mt-6">
          {actionHref ? (
            <Link href={actionHref}>
              <Button>{actionLabel}</Button>
            </Link>
          ) : (
            <Button onClick={onAction}>{actionLabel}</Button>
          )}
        </div>
      ) : null}
    </div>
  );
}

export { EmptyState };
export type { EmptyStateProps };
