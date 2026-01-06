import { ReactNode } from 'react';

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
}

export const SectionContainer = ({ children, className = '' }: SectionContainerProps) => {
  return (
    <div className={`h-full w-full overflow-hidden flex flex-col ${className}`}>
      {children}
    </div>
  );
};
