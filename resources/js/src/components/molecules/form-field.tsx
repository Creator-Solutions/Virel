import * as React from 'react';

import { FormLabel } from '@/src/components/atoms/form-label';
import { FormError } from '@/src/components/atoms/form-error';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
  hint?: string;
}

function FormField({ label, htmlFor, error, optional, children, hint }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <FormLabel htmlFor={htmlFor} optional={optional}>
        {label}
      </FormLabel>
      {children}
      {hint && !error && <p className="mt-2 text-sm text-virel-textSecondary">{hint}</p>}
      <FormError message={error} />
    </div>
  );
}

export { FormField };
export type { FormFieldProps };
