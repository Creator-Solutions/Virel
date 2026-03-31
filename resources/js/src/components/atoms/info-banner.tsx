import { Info } from 'lucide-react';

import * as React from 'react';

interface InfoBannerProps {
  children: React.ReactNode;
}

function InfoBanner({ children }: InfoBannerProps) {
  return (
    <div className="flex gap-3 rounded-md border border-virel-border bg-virel-surface p-4">
      <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-virel-textSecondary" />
      <div className="text-sm text-virel-textSecondary">{children}</div>
    </div>
  );
}

export { InfoBanner };
export type { InfoBannerProps };
