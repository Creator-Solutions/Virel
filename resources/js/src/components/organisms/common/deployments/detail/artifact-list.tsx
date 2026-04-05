import { ArtifactRow } from '@/src/components/molecules/common/deployments/detail/artifact-row';
import type { Artifact } from '@/domains/projects/projects.types';

interface ArtifactListProps {
  artifacts: Artifact[];
  onRollback: (artifact: Artifact) => void;
}

function ArtifactList({ artifacts, onRollback }: ArtifactListProps) {
  if (artifacts.length === 0) {
    return <p className="text-sm text-virel-textMuted">No artifacts available for this deployment.</p>;
  }

  return (
    <div className="divide-y divide-virel-border rounded-lg border border-virel-border bg-virel-surface">
      {artifacts.map((artifact) => (
        <ArtifactRow key={artifact.id} artifact={artifact} onRollback={onRollback} />
      ))}
    </div>
  );
}

export { ArtifactList };
export type { ArtifactListProps };
