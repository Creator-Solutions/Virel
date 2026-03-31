import * as React from 'react';

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
  children: React.ReactNode;
  optional?: boolean;
}

function FormLabel({ htmlFor, children, optional, className, ...props }: FormLabelProps) {
  return (
    <label htmlFor={htmlFor} className={`text-sm font-medium text-virel-text ${className || ''}`} {...props}>
      {children}
      {optional && <span className="ml-1 text-virel-textMuted">(Optional)</span>}
    </label>
  );
}

export { FormLabel };
export type { FormLabelProps };
