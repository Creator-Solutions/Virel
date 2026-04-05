import { ArrowLeftIcon } from 'lucide-react';

interface DeploymentHistoryHeaderProps {
  projectId: string;
  onNavigate: (path: string) => void;
}

function DeploymentHistoryHeader({ projectId, onNavigate }: DeploymentHistoryHeaderProps) {
  return (
    <div>
      <button
        onClick={() => onNavigate(`home/projects/${projectId}`)}
        className="mb-2 flex items-center gap-2 text-sm text-virel-textSecondary transition-colors hover:text-virel-text cursor-pointer"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Project
      </button>
      <h1 className="text-2xl font-bold tracking-tight text-virel-text">Deployment History</h1>
    </div>
  );
}

export { DeploymentHistoryHeader };
export type { DeploymentHistoryHeaderProps };
