import { useState, useEffect, ReactNode } from 'react';
import { Header } from '@/components/Header';

interface Section {
  id: string;
  content: ReactNode;
}

interface SectionNavigatorProps {
  sections: Section[];
}

export const SectionNavigator = ({ sections }: SectionNavigatorProps) => {
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    // Get the section ID from the URL hash on mount
    const hash = window.location.hash.slice(1);
    if (hash) {
      const index = sections.findIndex(s => s.id === hash);
      if (index !== -1) {
        setCurrentSection(index);
      }
    }

    // Listen for hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const index = sections.findIndex(s => s.id === hash);
        if (index !== -1) {
          setCurrentSection(index);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [sections]);

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Header - Fixed at top */}
      <div className="z-50 flex-shrink-0">
        <Header />
      </div>

      {/* Sections Container - Full screen below header */}
      <div className="flex-1 overflow-hidden relative">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSection
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none'
            }`}
            style={{ top: '80px' }} // Header height
          >
            <div className="h-full w-full overflow-hidden">
              {section.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
