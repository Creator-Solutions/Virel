import * as React from 'react';

interface ToggleProps {
  id?: string;
  name?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
}

function Toggle({ id, name, checked = false, onChange, disabled, label, description }: ToggleProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked);
  };

  return (
    <div className="flex items-start gap-3">
      <div className="relative flex shrink-0">
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="peer h-5 w-9 cursor-pointer appearance-none rounded-full border border-virel-border bg-transparent transition-all checked:border-virel-text checked:bg-virel-text disabled:cursor-not-allowed disabled:opacity-50"
        />
        <span className="pointer-events-none absolute start-0.5 top-0.5 h-4 w-4 rounded-full bg-virel-textMuted transition-all peer-checked:translate-x-4 peer-checked:bg-virel-base" />
      </div>
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label htmlFor={id} className="cursor-pointer text-sm font-medium text-virel-text">
              {label}
            </label>
          )}
          {description && <p className="text-xs text-virel-textSecondary">{description}</p>}
        </div>
      )}
    </div>
  );
}

export { Toggle };
export type { ToggleProps };
