import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';

import { useUsersStore } from '@/store/users.store';
import { usersService } from '@/domains/users/users.service';
import type { PaginatedUsers, UsersPageProps, InviteUserPayload, User } from '@/domains/users/users.types';
import { PageHeader } from '@/src/components/molecules/common/page-header';
import { UsersTable } from '@/src/components/organisms/users/users-table';
import { InviteUserModal } from '@/src/components/organisms/users/invite-user-modal';
import { ConfirmModal } from '@/src/components/atoms/confirm-modal';
import HomeLayout from '..';

const UsersPage = () => {
  const { users, isLoading, setUsers, setLoading } = useUsersStore();
  const pageProps = usePage().props as unknown as UsersPageProps;
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    if (pageProps.users) {
      setUsers(pageProps.users);
    }
  }, [pageProps.users]);

  const handleInvite = async (payload: InviteUserPayload) => {
    setIsInviting(true);
    try {
      await usersService.inviteUser(payload);
      setInviteModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to invite user:', error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleDelete = (user: User) => {
    setDeleteModal({ open: true, user });
  };

  const confirmDelete = async () => {
    if (deleteModal.user) {
      setLoading(true);
      try {
        await usersService.deleteUser(deleteModal.user.id);
        window.location.reload();
      } catch (error) {
        console.error('Failed to delete user:', error);
      } finally {
        setLoading(false);
        setDeleteModal({ open: false, user: null });
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Users"
        description="Manage users and their permissions."
        action={
          <button onClick={() => setInviteModalOpen(true)} className="btn-primary">
            <PlusIcon className="mr-2 h-4 w-4" />
            Invite User
          </button>
        }
      />
      <UsersTable users={users} onDelete={handleDelete} isLoading={isLoading} />
      <InviteUserModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onConfirm={handleInvite}
        isLoading={isInviting}
      />
      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, user: null })}
        onConfirm={confirmDelete}
        title="Delete User"
        description={
          deleteModal.user
            ? `Are you sure you want to delete "${deleteModal.user.name}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

UsersPage.layout = (page: ReactNode) => <HomeLayout>{page}</HomeLayout>;

export default UsersPage;
