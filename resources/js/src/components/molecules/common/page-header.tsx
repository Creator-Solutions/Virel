import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-virel-text">{title}</h1>
        {description && <p className="mt-1 text-sm text-virel-textSecondary">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export { PageHeader };
export type { PageHeaderProps };
