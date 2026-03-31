import * as React from 'react';

interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
}

function FormActions({ children, className }: FormActionsProps) {
  return <div className={`flex items-center gap-3 ${className ?? ''}`}>{children}</div>;
}

export { FormActions };
export type { FormActionsProps };
