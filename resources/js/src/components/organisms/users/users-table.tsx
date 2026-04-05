import { Link } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/src/components/atoms/table';
import { Badge } from '@/src/components/atoms/badge';
import { Pagination } from '@/src/components/atoms/pagination';
import { EmptyState } from '@/src/components/atoms/empty-state';
import type { User, PaginatedUsers } from '@/domains/users/users.types';

interface UsersTableProps {
  users: PaginatedUsers;
  onDelete: (user: User) => void;
  isLoading?: boolean;
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}

function UsersTable({ users, onDelete, isLoading }: UsersTableProps) {
  if (users.data.length === 0) {
    return <EmptyState title="No users found" description="There are no users in the system yet." />;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-virel-text">Name</TableHead>
            <TableHead className="text-virel-text">Email</TableHead>
            <TableHead className="text-virel-text">Role</TableHead>
            <TableHead className="text-virel-text">Created at</TableHead>
            <TableHead className="text-right text-virel-text">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.data.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium text-virel-text">{user.name}</TableCell>
              <TableCell className="text-virel-text">{user.email}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-virel-text">
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell className="text-virel-text">{timeAgo(user.created_at)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/home/users/${user.id}/edit`}
                    className="p-1.5 text-virel-textMuted transition-colors hover:text-virel-text"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => onDelete(user)}
                    className="p-1.5 text-virel-textMuted transition-colors hover:text-virel-errorText"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination currentPage={users.current_page} lastPage={users.last_page} onPageChange={() => {}} />
    </>
  );
}

export { UsersTable };
export type { UsersTableProps };
