import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/src/components/atoms/skeleton';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
  isLoading?: boolean;
}

function StatCard({ icon: Icon, label, value, color, isLoading }: StatCardProps) {
  return (
    <div className="rounded-lg border border-virel-border bg-virel-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-virel-textSecondary">{label}</p>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      {isLoading ? (
        <Skeleton className="mt-2 h-10 w-20" />
      ) : (
        <p className="mt-2 text-3xl font-semibold text-virel-text">{value}</p>
      )}
    </div>
  );
}

export { StatCard };
export type { StatCardProps };
