import * as React from 'react';

import { cn } from '@/lib/utils';
import { Button } from './button';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, lastPage, onPageChange }: PaginationProps) {
  if (lastPage <= 1) {
    return null;
  }

  const pages: (number | 'ellipsis')[] = [];
  const delta = 1;
  const left = currentPage - delta;
  const right = currentPage + delta;

  for (let i = 1; i <= lastPage; i++) {
    if (
      i === 1 ||
      i === lastPage ||
      (i >= left && i <= right) ||
      (currentPage <= delta && i <= 5) ||
      (currentPage > lastPage - delta && i > lastPage - 5)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis');
    }
  }

  return (
    <div className="flex items-center justify-between border-t border-virel-border px-4 py-3">
      <span className="text-sm text-virel-textSecondary">
        Page {currentPage} of {lastPage}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="text-virel-textSecondary"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        {pages.map((page, index) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-virel-textMuted">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? 'default' : 'ghost'}
              size="icon-sm"
              onClick={() => onPageChange(page)}
              className={cn('min-w-[32px]', page !== currentPage && 'text-virel-textSecondary')}
            >
              {page}
            </Button>
          ),
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={currentPage === lastPage}
          onClick={() => onPageChange(currentPage + 1)}
          className="text-virel-textSecondary"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export { Pagination };
export type { PaginationProps };
