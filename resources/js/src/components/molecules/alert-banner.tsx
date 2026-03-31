import * as React from 'react';
import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertBannerProps {
  variant?: AlertVariant;
  children: ReactNode;
}

const variantStyles = {
  success: 'border-virel-successBg bg-virel-successBg/20 text-virel-successText',
  error: 'border-virel-errorBg bg-virel-errorBg/20 text-virel-errorText',
  warning: 'border-virel-warningBg bg-virel-warningBg/20 text-virel-warningText',
  info: 'border-virel-infoBg bg-virel-infoBg/20 text-virel-infoText',
};

const variantIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

function AlertBanner({ variant = 'info', children }: AlertBannerProps) {
  const Icon = variantIcons[variant];

  return (
    <div className={`mb-4 flex items-start gap-3 rounded-md border p-3 text-sm ${variantStyles[variant]}`}>
      <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export { AlertBanner };
export type { AlertBannerProps };
