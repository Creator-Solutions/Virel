import * as React from 'react';

import { FormField } from './form-field';
import { TextInput, type TextInputProps } from '@/src/components/atoms/text-input';

interface TextFieldProps extends Omit<TextInputProps, 'className'> {
  label: string;
  error?: string;
  optional?: boolean;
  hint?: string;
}

function TextField({ label, error, optional, hint, id, name, ...props }: TextFieldProps) {
  const inputId = id || name;

  return (
    <FormField label={label} htmlFor={inputId} error={error} optional={optional} hint={hint}>
      <TextInput id={inputId} name={name} {...props} />
    </FormField>
  );
}

export { TextField };
export type { TextFieldProps };
