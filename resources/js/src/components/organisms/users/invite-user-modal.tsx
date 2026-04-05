import { useState } from 'react';

import { TextInput } from '@/src/components/atoms/text-input';
import { FormLabel } from '@/src/components/atoms/form-label';
import { Button } from '@/src/components/atoms/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/src/components/atoms/sheet';
import type { InviteUserPayload } from '@/domains/users/users.types';

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: InviteUserPayload) => void;
  isLoading?: boolean;
}

function InviteUserModal({ open, onClose, onConfirm, isLoading }: InviteUserModalProps) {
  const [formData, setFormData] = useState<InviteUserPayload>({
    name: '',
    email: '',
    role: 'developer',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onConfirm(formData);
    setFormData({ name: '', email: '', role: 'developer' });
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', role: 'developer' });
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <SheetContent side="right" className="w-[400px] !border-l-0 border-none bg-virel-base shadow-none">
        <SheetHeader>
          <SheetTitle>Invite User</SheetTitle>
          <SheetDescription asChild>
            <div className="text-sm text-virel-textSecondary">
              Add a new user to the system by entering their details below.
            </div>
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <div>
            <FormLabel htmlFor="invite-name">Name</FormLabel>
            <TextInput
              id="invite-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
            />
          </div>
          <div>
            <FormLabel htmlFor="invite-email">Email</FormLabel>
            <TextInput
              id="invite-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
            />
          </div>
          <div>
            <FormLabel htmlFor="invite-role">Role</FormLabel>
            <select id="invite-role" name="role" value={formData.role} onChange={handleChange} className="input-field">
              <option value="pm">PM</option>
              <option value="developer">Developer</option>
              <option value="qa">QA</option>
            </select>
          </div>
        </div>
        <SheetFooter className="mt-6 flex-row justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Inviting...' : 'Invite'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export { InviteUserModal };
export type { InviteUserModalProps };
