import { useState } from 'react';

import { TextInput } from '@/src/components/atoms/text-input';
import { FormLabel } from '@/src/components/atoms/form-label';
import { FormError } from '@/src/components/atoms/form-error';
import { Button } from '@/src/components/atoms/button';
import { SectionDivider } from '@/src/components/atoms/section-divider';
import type { User, Role, UpdateUserPayload } from '@/domains/users/users.types';

interface EditUserFormProps {
  user: User;
  errors?: Record<string, string[]>;
  onSubmit: (payload: UpdateUserPayload) => void;
  isLoading?: boolean;
}

function EditUserForm({ user, errors = {}, onSubmit, isLoading }: EditUserFormProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit({
      name: formData.name,
      email: formData.email,
      role: formData.role as Role,
    });
  };

  return (
    <div className="space-y-8">
      <SectionDivider heading="Profile Information">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FormLabel htmlFor="name">Name</FormLabel>
            <TextInput id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter name" />
            <FormError message={errors.name?.[0]} />
          </div>
          <div>
            <FormLabel htmlFor="email">Email</FormLabel>
            <TextInput
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
            <FormError message={errors.email?.[0]} />
          </div>
        </div>
        <div className="mt-4">
          <FormLabel htmlFor="role">Role</FormLabel>
          <select id="role" name="role" value={formData.role} onChange={handleChange} className="input-field">
            <option value="pm">PM</option>
            <option value="developer">Developer</option>
            <option value="qa">QA</option>
          </select>
          <FormError message={errors.role?.[0]} />
        </div>
      </SectionDivider>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-virel-text text-virel-base hover:bg-virel-text/90"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

export { EditUserForm };
export type { EditUserFormProps };
