import { EyeIcon, EyeOffIcon } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';

import { Input } from '../../atoms/input';

interface PasswordFieldProps extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type'
> {
    id: string;
    label: string;
    error?: string;
    forgotPassword?: () => void;
}

function PasswordField({
    id,
    label,
    error,
    forgotPassword,
    value,
    onChange,
    ...props
}: PasswordFieldProps) {
    const [show, setShow] = useState(false);

    return (
        <div>
            <div className="flex items-center justify-between">
                <label
                    htmlFor={id}
                    className="block text-sm font-medium text-virel-text"
                >
                    {label}
                </label>
                {forgotPassword && (
                    <button
                        type="button"
                        onClick={forgotPassword}
                        className="text-sm font-medium text-virel-textSecondary transition-colors hover:text-virel-text"
                    >
                        Forgot your password?
                    </button>
                )}
            </div>
            <div className="relative mt-2">
                <Input
                    id={id}
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    className={`pr-10 ${error ? 'border-virel-errorText' : ''}`}
                    {...props}
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-virel-textMuted hover:text-virel-text"
                >
                    {show ? (
                        <EyeOffIcon className="h-4 w-4" />
                    ) : (
                        <EyeIcon className="h-4 w-4" />
                    )}
                </button>
            </div>
            {error && (
                <p className="mt-1 text-sm text-virel-errorText">{error}</p>
            )}
        </div>
    );
}

export { PasswordField };
export type { PasswordFieldProps };
