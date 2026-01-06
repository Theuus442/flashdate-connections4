import { useState, ReactNode } from 'react';
import { Header } from '@/components/Header';

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabNavigationProps {
  tabs: Tab[];
}

export const TabNavigation = ({ tabs }: TabNavigationProps) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header - Fixed at top */}
      <div className="z-50 flex-shrink-0">
        <Header />
      </div>

      {/* Tab Buttons - Below header */}
      <div className="z-40 bg-gradient-to-b from-background via-background/80 to-transparent px-6 py-3 border-b border-border/30 flex-shrink-0">
        <div className="container mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(index)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  activeTab === index
                    ? 'bg-gold text-background font-semibold'
                    : 'bg-card border border-border text-foreground/70 hover:text-foreground hover:border-gold/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content - Scrollable area */}
      <div className="flex-1 overflow-hidden relative">
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            className={`absolute inset-0 transition-opacity duration-300 ${
              activeTab === index ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="h-full overflow-y-auto overscroll-none">
              {tab.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
