import { Archive, RotateCcw } from 'lucide-react';

import { Button } from '@/src/components/atoms/button';
import type { Artifact } from '@/domains/projects/projects.types';
import { formatRelativeTime, formatBytes } from '@/lib/utils';

interface RecentArtifactsListProps {
  artifacts: Artifact[];
  onRollback: (artifact: Artifact) => void;
}

function RecentArtifactsList({ artifacts, onRollback }: RecentArtifactsListProps) {
  if (artifacts.length === 0) {
    return (
      <div className="overflow-hidden rounded-lg border border-virel-border bg-virel-surface">
        <div className="p-6 text-center text-sm text-virel-textMuted">No backups available yet.</div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-virel-border overflow-hidden rounded-lg border border-virel-border bg-virel-surface">
      {artifacts.map((artifact) => {
        const fileName = artifact.file_path.split('/').pop() || artifact.file_path;

        return (
          <div key={artifact.id} className="flex items-center justify-between gap-4 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <Archive className="h-5 w-5 shrink-0 text-virel-textMuted" />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-virel-text">{fileName}</div>
                <div className="text-xs text-virel-textMuted">
                  {formatBytes(artifact.file_size)} · {formatRelativeTime(artifact.created_at)}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onRollback(artifact)} className="shrink-0 text-virel-text">
              <RotateCcw className="mr-1 h-4 w-4" />
              Restore
            </Button>
          </div>
        );
      })}
    </div>
  );
}

export { RecentArtifactsList };
export type { RecentArtifactsListProps };
