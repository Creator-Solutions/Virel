import * as React from 'react';
import type { ReactNode } from 'react';

interface DangerZoneCardProps {
  children: ReactNode;
}

function DangerZoneCard({ children }: DangerZoneCardProps) {
  return <div className="space-y-6 rounded-lg border border-virel-errorBg p-6">{children}</div>;
}

export { DangerZoneCard };
export type { DangerZoneCardProps };
