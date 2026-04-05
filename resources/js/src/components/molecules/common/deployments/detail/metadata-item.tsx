import type { ReactNode } from 'react';

interface MetadataItemProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}

function MetadataItem({ icon, label, value }: MetadataItemProps) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2 text-sm font-medium text-virel-textSecondary">
        {icon} {label}
      </div>
      <div className="text-virel-text capitalize">{value}</div>
    </div>
  );
}

export { MetadataItem };
export type { MetadataItemProps };
