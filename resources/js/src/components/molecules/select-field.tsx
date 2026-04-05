import * as React from 'react';

import { FormField } from './form-field';
import { SelectInput, type SelectInputProps } from '@/src/components/atoms/select-input';

interface SelectFieldProps extends Omit<SelectInputProps, 'className'> {
  label: string;
  error?: string;
  optional?: boolean;
  hint?: string;
}

function SelectField({
  label,
  error,
  optional,
  hint,
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  ...props
}: SelectFieldProps) {
  const inputId = id || name;

  return (
    <FormField label={label} htmlFor={inputId} error={error} optional={optional} hint={hint}>
      <SelectInput
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
        {...props}
      />
    </FormField>
  );
}

export { SelectField };
export type { SelectFieldProps };
