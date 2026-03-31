import * as React from 'react';

import { cn } from '@/lib/utils';
import { Button } from './button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from './sheet';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  variant?: 'danger' | 'default';
}

function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  variant = 'default',
}: ConfirmModalProps) {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="w-[400px] bg-virel-base !border-l-0 border-none shadow-none">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription asChild>
            <div className="text-sm text-virel-textSecondary">{description}</div>
          </SheetDescription>
        </SheetHeader>
        <SheetFooter className="mt-6 flex-row justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'default'}
            onClick={onConfirm}
            className={cn(
              'border-1 border-text-virel cursor-pointer',
              variant === 'danger' &&
                'bg-virel-errorBg text-virel-errorText border-virel-errorText hover:bg-virel-errorBg/80'
            )}
          >
            {confirmLabel}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export { ConfirmModal };
export type { ConfirmModalProps };
