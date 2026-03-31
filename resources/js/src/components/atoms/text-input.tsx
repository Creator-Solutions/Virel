import * as React from 'react';

import { cn } from '@/lib/utils';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  name?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function TextInput({
  id,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  className,
  disabled,
  ...props
}: TextInputProps) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      className={cn('input-field', className)}
      {...props}
    />
  );
}

export { TextInput };
export type { TextInputProps };
