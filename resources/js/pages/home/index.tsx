import type { ReactNode } from 'react';
import { router } from '@inertiajs/react';
import { bottomNavs, navItems } from '@/lib/constants';
import { AppLogo, Badge } from '@/src/components/atoms';
import { Link, usePage } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import { AppBreadcrumb } from '@/src/components/molecules';
import { getRole } from '@/lib/utils';

interface HomeLayoutProps {
  children: ReactNode;
}

const HomeLayout = ({ children }: HomeLayoutProps) => {
  const { auth } = usePage().props;
  const user = auth?.user;
  const isAdmin = user?.role === 'pm';

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    router.post('/logout');
  };

  return (
    <div className="flex h-screen flex-col bg-virel-base">
      <div className="flex h-full w-full flex-row">
        {/* Sidebar */}
        <div className="flex h-full w-62 flex-col border-r border-virel-border">
          {/* Logo */}
          <div className="flex h-14 flex-col items-start justify-center border-b border-virel-border">
            <AppLogo className="ml-4 flex-row" />
          </div>

          {/* Main nav */}
          <div className="mt-6 flex flex-1 flex-col gap-y-1">
            {navItems
              .filter((item) => !item.isAdmin)
              .map((item, index) => (
                <div
                  key={index}
                  className="flex h-12 w-11/12 flex-row items-center gap-x-2 self-center rounded-full hover:bg-virel-surface"
                >
                  <item.icon color="gray" className="ml-4 h-4 w-4" />
                  <Link href={item.href} className="text-sm text-virel-text">
                    {item.label}
                  </Link>
                </div>
              ))}
            {isAdmin && navItems.some((item) => item.isAdmin) && (
              <>
                <div className="mt-4 mb-2 w-11/12">
                  <p className="pl-4 text-xs font-semibold tracking-wider text-virel-textSecondary uppercase">Admin</p>
                </div>
                {navItems
                  .filter((item) => item.isAdmin)
                  .map((item, index) => (
                    <div
                      key={index}
                      className="flex h-12 w-11/12 flex-row items-center gap-x-2 self-center rounded-full hover:bg-virel-surface"
                    >
                      <item.icon color="gray" className="ml-4 h-4 w-4" />
                      <Link href={item.href} className="text-sm text-virel-text">
                        {item.label}
                      </Link>
                    </div>
                  ))}
              </>
            )}
          </div>

          {/* Bottom nav */}
          <div className="flex flex-col gap-y-2 border-t border-virel-border pb-4">
            {bottomNavs
              .filter((item) => !item.isAdmin)
              .map((item, index) => (
                <div
                  key={index}
                  className="mt-4 flex h-12 w-11/12 flex-row items-center gap-x-2 self-center rounded-full hover:bg-virel-surface"
                >
                  <item.icon color="gray" className="ml-4 h-4 w-4" />
                  <Link href={item.href} className="text-sm text-virel-text">
                    {item.label}
                  </Link>
                </div>
              ))}
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 flex h-12 w-11/12 flex-row items-center gap-x-2 self-center rounded-full text-sm text-virel-text hover:bg-virel-surface"
            >
              <LogOut color="gray" className="ml-4 h-4 w-4" />
              Log out
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div className="h-screen flex-1">
          {/* Top bar */}
          <div className="flex h-14 flex-row items-center justify-between border-b border-virel-border">
            <AppBreadcrumb />
            <div className="mr-4 ml-4 flex flex-row items-center gap-x-4">
              <p className="text-sm text-virel-text">{user.name}</p>
              <Badge className="inline-flex items-center rounded border border-dashed border-virel-border bg-transparent text-xs font-medium text-virel-textMuted">
                {getRole(user.role)}
              </Badge>
            </div>
          </div>

          {/* Page content */}
          <div className="h-[calc(100vh-56px)] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default HomeLayout;
