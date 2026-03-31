import type { LucideIcon } from 'lucide-react';
import { FolderKanbanIcon, LayoutDashboardIcon, Settings, UserIcon } from 'lucide-react';

export type NavItems = {
  label: string;
  href: string;
  isAdmin: boolean;
  icon: LucideIcon;
};

export const navItems: NavItems[] = [
  {
    label: 'Dashboard',
    href: '/home/dashboard',
    isAdmin: false,
    icon: LayoutDashboardIcon,
  },
  {
    label: 'Projects',
    href: '/home/projects',
    isAdmin: false,
    icon: FolderKanbanIcon,
  },
  {
    label: 'Users',
    href: '/home/users',
    isAdmin: true,
    icon: UserIcon,
  },
];

export const bottomNavs: NavItems[] = [
  {
    label: 'Settings',
    href: '/home/settings',
    isAdmin: false,
    icon: Settings,
  },
];
