import * as React from 'react';
import type { ReactNode } from 'react';

interface ActionRowProps {
  title: string;
  description: string;
  action: ReactNode;
  hideDivider?: boolean;
}

function ActionRow({ title, description, action, hideDivider = false }: ActionRowProps) {
  return (
    <div
      className={`flex flex-col justify-between gap-4 sm:flex-row sm:items-center ${!hideDivider ? 'border-t border-virel-border pt-6' : ''}`}
    >
      <div>
        <h3 className="text-sm font-medium text-virel-text">{title}</h3>
        <p className="mt-1 text-sm text-virel-textSecondary">{description}</p>
      </div>
      <div>{action}</div>
    </div>
  );
}

export { ActionRow };
export type { ActionRowProps };
