import { MonoText } from '@/src/components/atoms/mono-text';
import type { Artifact } from '@/domains/projects/projects.types';

interface ArtifactRowProps {
  artifact: Artifact;
  onRollback: (artifact: Artifact) => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffSecs / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}

function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ArtifactRow({ artifact, onRollback }: ArtifactRowProps) {
  const fileName = artifact.file_path.split('/').pop() || artifact.file_path;

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
        <MonoText className="text-virel-text">{fileName}</MonoText>
        <div className="flex items-center gap-4 text-sm text-virel-textSecondary">
          <span>{formatBytes(artifact.file_size)}</span>
          <span title={formatFullDate(artifact.created_at)}>{formatRelativeTime(artifact.created_at)}</span>
        </div>
      </div>
      <button onClick={() => onRollback(artifact)} className="btn-secondary py-1.5 text-xs">
        Rollback
      </button>
    </div>
  );
}

export { ArtifactRow };
export type { ArtifactRowProps };
