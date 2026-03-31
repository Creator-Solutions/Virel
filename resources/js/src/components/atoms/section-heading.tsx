import * as React from 'react';

interface SectionHeadingProps {
  children: React.ReactNode;
}

function SectionHeading({ children }: SectionHeadingProps) {
  return <h2 className="mb-4 text-lg font-medium text-virel-text">{children}</h2>;
}

export { SectionHeading };
export type { SectionHeadingProps };
