import * as React from 'react';

import { FormField } from './form-field';
import { PasswordInput, type PasswordInputProps } from '@/src/components/atoms/password-input';

interface PasswordFieldProps extends Omit<PasswordInputProps, 'className'> {
  label: string;
  error?: string;
  optional?: boolean;
  hint?: string;
}

function PasswordField({ label, error, optional, hint, id, name, ...props }: PasswordFieldProps) {
  const inputId = id || name;

  return (
    <FormField label={label} htmlFor={inputId} error={error} optional={optional} hint={hint}>
      <PasswordInput id={inputId} name={name} {...props} />
    </FormField>
  );
}

export { PasswordField };
export type { PasswordFieldProps };
