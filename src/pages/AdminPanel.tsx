import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Heart, LogOut } from 'lucide-react';
import { UsersManagement } from '@/components/admin/UsersManagement';
import { EventsManagement } from '@/components/admin/EventsManagement';
import { SelectionsManagement } from '@/components/admin/SelectionsManagement';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

type AdminTab = 'users' | 'events' | 'selections';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso!');
      navigate('/');
    } catch (err) {
      toast.error('Erro ao fazer logout');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with back button */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <a href="/" className="flex items-center gap-2">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F8f3ace03e7c74437bf1e2c3a827303bb%2F72efb2f93aeb4f98a010f02c385b13d6?format=webp&width=800"
                alt="Flashdate Logo"
                className="h-16 w-auto"
              />
              <span className="hidden sm:inline font-bold text-lg text-foreground">
                FlashDate<span className="text-gold">⚡</span>
              </span>
            </a>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm text-muted-foreground">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-foreground hover:text-gold transition-colors px-3 py-2 rounded-lg hover:bg-muted"
                title="Logout"
              >
                <LogOut size={20} />
                <span className="hidden sm:inline text-sm">Sair</span>
              </button>
            </div>
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
            {activeTab === 'selections' && <SelectionsManagement />}
          </div>
        </div>
      </div>
    </div>
  );
}
