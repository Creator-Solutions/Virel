import * as React from 'react';

import { SectionHeading } from './section-heading';

interface SectionDividerProps {
  children: React.ReactNode;
  heading?: string;
}

function SectionDivider({ children, heading }: SectionDividerProps) {
  return (
    <section className="border-t border-virel-border pt-6">
      {heading && <SectionHeading>{heading}</SectionHeading>}
      {children}
    </section>
  );
}

export { SectionDivider };
export type { SectionDividerProps };
