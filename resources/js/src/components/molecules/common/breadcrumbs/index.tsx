// resources/js/src/components/atoms/breadcrumb.tsx

import { usePage } from '@inertiajs/react';
import { Fragment } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/src/components/atoms/breadcrumb';

export interface BreadcrumbSegment {
  label: string;
  href: string;
}

interface AppBreadcrumbProps {
  overrides?: Record<string, string>;
}

export type BreadcrumbSegments = BreadcrumbSegment[];

function formatLabel(segment: string): string {
  return segment.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildSegments(url: string, overrides: Record<string, string>): BreadcrumbSegments {
  const path = url.split('?')[0];
  const parts = path.split('/').filter((part) => Boolean(part) && part !== 'home');

  return parts.map((part, index) => ({
    label: overrides[part] ?? formatLabel(part),
    href: '/' + parts.slice(0, index + 1).join('/'),
  }));
}

export function AppBreadcrumb({ overrides = {} }: AppBreadcrumbProps) {
  const { url } = usePage();
  const segments = buildSegments(url, overrides);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink className="ml-4 hover:text-virel-text" href="/home/dashboard">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;

          return (
            <Fragment key={segment.href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="text-white">
                {isLast ? (
                  <BreadcrumbPage className="text-white">{segment.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink className="text-white hover:text-virel-text" href={`/home${segment.href}`}>
                    {segment.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
