import * as React from 'react';

import { FormField } from './form-field';
import { TextInput, type TextInputProps } from '@/src/components/atoms/text-input';

interface TextFieldProps extends Omit<TextInputProps, 'className'> {
  label: string;
  error?: string;
  optional?: boolean;
  hint?: string;
  rightElement?: React.ReactNode;
}

function TextField({ label, error, optional, hint, id, name, rightElement, ...props }: TextFieldProps) {
  const inputId = id || name;

  return (
    <FormField label={label} htmlFor={inputId} error={error} optional={optional} hint={hint}>
      <div className="relative">
        <TextInput id={inputId} name={name} {...props} />
        {rightElement && <div className="absolute top-1/2 right-3 -translate-y-1/2">{rightElement}</div>}
      </div>
    </FormField>
  );
}

export { TextField };
export type { TextFieldProps };
