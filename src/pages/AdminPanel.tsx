import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Calendar, Heart } from 'lucide-react';
import { UsersManagement } from '@/components/admin/UsersManagement';
import { EventsManagement } from '@/components/admin/EventsManagement';
import { SelectionsManagement } from '@/components/admin/SelectionsManagement';

type AdminTab = 'users' | 'events' | 'selections';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with back button */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <a href="/" className="flex items-center gap-2">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F73d680b1b3a649a9a5bc7e1247d963e4%2F685f0706602c47e4964899c8526c67cd?format=webp&width=800"
                alt="Flashdate Logo"
                className="h-10 w-auto"
              />
              <span className="hidden sm:inline font-bold text-lg text-foreground">
                Flash<span className="text-gold">⚡</span>Date
              </span>
            </a>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-foreground hover:text-gold transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Voltar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <div className="flex-1 pt-20 flex flex-col">
        {/* Tab Navigation */}
        <div className="border-b border-border bg-card/50 overflow-x-auto">
          <div className="container mx-auto px-6">
            <div className="flex gap-0 min-w-max sm:min-w-full">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-3 sm:px-6 py-3 sm:py-4 font-medium transition-colors border-b-2 text-sm sm:text-base whitespace-nowrap ${
                  activeTab === 'users'
                    ? 'border-gold text-gold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Users size={18} />
                <span className="hidden sm:inline">Usuários</span>
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`flex items-center gap-2 px-3 sm:px-6 py-3 sm:py-4 font-medium transition-colors border-b-2 text-sm sm:text-base whitespace-nowrap ${
                  activeTab === 'events'
                    ? 'border-gold text-gold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Calendar size={18} />
                <span className="hidden sm:inline">Eventos</span>
              </button>
              <button
                onClick={() => setActiveTab('selections')}
                className={`flex items-center gap-2 px-3 sm:px-6 py-3 sm:py-4 font-medium transition-colors border-b-2 text-sm sm:text-base whitespace-nowrap ${
                  activeTab === 'selections'
                    ? 'border-gold text-gold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Heart size={18} />
                <span className="hidden sm:inline">Seleções</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pb-8">
          <div className="container mx-auto px-6 py-8">
            {activeTab === 'users' && <UsersManagement />}
            {activeTab === 'events' && <EventsManagement />}
          </div>
        </div>
      </div>
    </div>
  );
}
