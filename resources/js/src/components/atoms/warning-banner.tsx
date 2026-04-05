import { TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

interface WarningBannerProps {
  message: string;
  action?: ReactNode;
}

function WarningBanner({ message, action }: WarningBannerProps) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-yellow-500/30 bg-yellow-500/10 p-4">
      <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
      <div className="flex flex-col">
        <span className="text-sm text-yellow-200">{message}</span>
        {action}
      </div>
    </div>
  );
}

export { WarningBanner };
export type { WarningBannerProps };
