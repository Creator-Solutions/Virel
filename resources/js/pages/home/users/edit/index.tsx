import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { EditUserForm } from '@/src/components/organisms/users/edit-user-form';
import { ChangePasswordForm } from '@/src/components/organisms/users/change-password-form';
import { PageHeader } from '@/src/components/molecules/common/page-header';
import type { EditUserPageProps } from '@/domains/users/users.types';
import { updateUser, updateUserPassword } from '@/domains/users/users.service';
import HomeLayout from '../..';

const EditUser = () => {
  const { user, errors } = usePage().props as unknown as EditUserPageProps;
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  const handleUserUpdate = (payload: Parameters<typeof updateUser>[1]) => {
    setIsLoadingUser(true);
    updateUser(user.id, payload).finally(() => {
      setIsLoadingUser(false);
    });
  };

  const handlePasswordUpdate = (payload: Parameters<typeof updateUserPassword>[1]) => {
    setIsLoadingPassword(true);
    updateUserPassword(user.id, payload).finally(() => {
      setIsLoadingPassword(false);
    });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <PageHeader title="Edit User" description="Manage user profile and security settings." />
      <div className="mx-auto max-w-3xl space-y-12">
        <EditUserForm user={user} errors={errors} onSubmit={handleUserUpdate} isLoading={isLoadingUser} />
        <ChangePasswordForm errors={errors} onSubmit={handlePasswordUpdate} isLoading={isLoadingPassword} />
      </div>
    </div>
  );
};

EditUser.layout = (page: ReactNode) => <HomeLayout>{page}</HomeLayout>;

export default EditUser;
