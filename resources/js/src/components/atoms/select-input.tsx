import * as React from 'react';

export interface SelectInputProps extends React.InputHTMLAttributes<HTMLSelectElement> {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

function SelectInput({
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
  className,
  disabled,
  ...props
}: SelectInputProps) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`input-field ${className || ''}`}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export { SelectInput };
