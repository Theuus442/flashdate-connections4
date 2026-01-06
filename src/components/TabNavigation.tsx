import { useState, ReactNode } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';

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
    <div className="fixed inset-0 bg-background overflow-hidden">
      {/* Header - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      {/* Tab Buttons - Fixed below header */}
      <div className="fixed top-20 left-0 right-0 z-40 bg-gradient-to-b from-background via-background/80 to-transparent px-6 py-4">
        <div className="container mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(index)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  activeTab === index
                    ? 'bg-gold text-background'
                    : 'bg-card border border-border text-foreground/80 hover:text-foreground hover:border-gold/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content - Fullscreen sections */}
      <div className="pt-44 h-screen overflow-hidden">
        <div className="h-full overflow-hidden relative">
          {tabs.map((tab, index) => (
            <div
              key={tab.id}
              className={`absolute inset-0 transition-opacity duration-300 ${
                activeTab === index ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
              style={{ top: '176px' }} // Header height + tab buttons height
            >
              <div className="h-full overflow-y-auto overscroll-none">
                {tab.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
