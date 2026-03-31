import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ZodSchema } from 'zod';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateWithZod<T>(schema: ZodSchema<T>) {
  return (values: T): Partial<Record<keyof T, string>> => {
    const result = schema.safeParse(values);

    if (result.success) {
      return {};
    }

    const errors: Partial<Record<keyof T, string>> = {};

    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof T;

      if (!errors[key]) {
        errors[key] = issue.message;
      }
    }

    return errors;
  };
}

export const getRole = (role: string) => {
  switch (role) {
    case 'developer':
      return 'Developer';
    case 'pm':
      return 'Project Manager';
    case 'qa':
      return 'Quality Assurance';
  }
};

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second');
  if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
}

export function formatDuration(startedAt: string | null, completedAt: string | null): string {
  if (!startedAt || !completedAt) return '—';
  const diff = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
