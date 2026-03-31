import * as React from 'react';
import type { ReactNode } from 'react';

interface FormFieldGridProps {
  children: ReactNode;
  columns?: 1 | 2;
  className?: string;
}

function FormFieldGrid({ children, columns = 2, className }: FormFieldGridProps) {
  const gridClass = columns === 2 ? 'grid grid-cols-1 gap-4 sm:grid-cols-2' : 'grid grid-cols-1 gap-4';

  return <div className={`${gridClass} ${className || ''}`}>{children}</div>;
}

export { FormFieldGrid };
export type { FormFieldGridProps };
