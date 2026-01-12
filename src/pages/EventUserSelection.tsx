import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Heart, Users, X, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useUsers } from '@/context/UsersContext';
import { User } from '@/context/UsersContext';

interface Selection {
  userId: string;
  type: 'match' | 'friendship' | 'no-interest';
}

export default function EventUserSelection() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { users, isLoading, refreshUsers } = useUsers();
  const [selections, setSelections] = useState<Selection[]>([]);
  const [participants, setParticipants] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'original'>('original');
  const [genderFilter, setGenderFilter] = useState<'all' | 'M' | 'F' | 'Outro'>('all');

  // Refresh users on mount to ensure we have latest data
  useEffect(() => {
    if (!authUser) return;
    console.log('[EventUserSelection] Refreshing users list...');
    refreshUsers();
  }, [authUser, refreshUsers]);

  // Load current user and participants from database
  useEffect(() => {
    if (!authUser) {
      console.log('[EventUserSelection] No auth user yet');
      return;
    }

    console.log('[EventUserSelection] Loading data...', {
      authUserId: authUser.id,
      usersCount: users.length,
      isLoading,
    });

    // Get current user from users array
    const user = users.find(u => u.id === authUser.id);
    if (user) {
      console.log('[EventUserSelection] ✅ Current user loaded:', user.name);
      setCurrentUser(user);
    } else {
      console.log('[EventUserSelection] ⚠️ Current user not found in users array');
      // Fallback: try to create a minimal user object from auth
      if (authUser.email) {
        setCurrentUser({
          id: authUser.id,
          email: authUser.email,
          name: authUser.email.split('@')[0], // Use part of email as name
          username: authUser.email.split('@')[0],
          whatsapp: '',
          gender: 'Outro',
          role: 'client',
        });
      }
    }

    // Get other participants (excluding current user and admin users)
    const otherUsers = users.filter(u => {
      const isCurrentUser = u.id === authUser.id;
      const isAdmin = u.role === 'admin';
      const isParticipant = !isCurrentUser && !isAdmin;

      if (!isParticipant && u.id !== authUser.id) {
        console.log('[EventUserSelection] Filtering out:', {
          name: u.name,
          id: u.id,
          role: u.role,
          isCurrentUser,
          isAdmin,
        });
      }

      return isParticipant;
    });

    console.log('[EventUserSelection] Participants loaded:', {
      count: otherUsers.length,
      totalUsers: users.length,
      currentUserId: authUser.id,
      participantNames: otherUsers.map(u => ({ name: u.name, role: u.role })),
    });
    setParticipants(otherUsers);

    if (otherUsers.length === 0 && users.length > 0) {
      console.warn('[EventUserSelection] No participants found but users exist', {
        totalUsers: users.length,
        userRoles: users.map(u => ({ name: u.name, role: u.role, id: u.id })),
      });
      toast.warning('Nenhum outro participante disponível');
    }
  }, [authUser, users]);

  // Filter and sort participants based on current filters
  const filteredParticipants = useMemo(() => {
    let filtered = participants;

    // Apply gender filter
    if (genderFilter !== 'all') {
      filtered = filtered.filter(u => u.gender === genderFilter);
    }

    // Apply sorting
    if (sortBy === 'name') {
      filtered = [...filtered].sort((a, b) =>
        (a.username || '').localeCompare(b.username || '', 'pt-BR')
      );
    }

    return filtered;
  }, [participants, sortBy, genderFilter]);

  // Show error if not authenticated
  if (!authUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Erro: Você precisa estar autenticado</p>
          <Button onClick={() => navigate('/login')} variant="gold">
            Ir para Login
          </Button>
        </div>
      </div>
    );
  }

  // Show message if no participants and finished loading
  if (!isLoading && participants.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
              {users.length === 0 ? 'Carregando...' : 'Nenhum participante disponível'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {users.length === 0
                ? 'Não conseguimos carregar os usuários. Tente recarregar a página ou entre em contato com o suporte.'
                : 'No momento não há outros participantes para você selecionar.'}
            </p>
          </div>
          <div className="flex gap-3">
            {users.length === 0 && (
              <Button onClick={() => window.location.reload()} variant="outline" className="flex-1">
                Recarregar
              </Button>
            )}
            <Button onClick={() => navigate('/dashboard')} variant="gold" className="flex-1">
              {users.length === 0 ? 'Voltar' : 'Dashboard'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSelection = (participantId: string, type: 'match' | 'friendship' | 'no-interest') => {
    const existingSelection = selections.find(s => s.userId === participantId);
    
    if (existingSelection) {
      if (existingSelection.type === type) {
        // Remove if clicking same button
        setSelections(selections.filter(s => s.userId !== participantId));
      } else {
        // Update if clicking different button
        setSelections(selections.map(s =>
          s.userId === participantId ? { ...s, type } : s
        ));
      }
    } else {
      // Add new selection
      setSelections([...selections, { userId: participantId, type }]);
    }
  };

  const handleFinish = () => {
    if (selections.length === 0) {
      toast.error('Faça pelo menos uma seleção antes de finalizar');
      return;
    }
    const matchCount = selections.filter(s => s.type === 'match').length;
    const friendshipCount = selections.filter(s => s.type === 'friendship').length;
    toast.success(`Seleções finalizadas! ${matchCount} match(es) e ${friendshipCount} amizade(s)`);
    navigate('/dashboard');
  };

  const getGenderLabel = (gender: string) => {
    switch(gender) {
      case 'M': return 'Masculino';
      case 'F': return 'Feminino';
      default: return 'Outro';
    }
  };

  const matchCount = selections.filter(s => s.type === 'match').length;
  const friendshipCount = selections.filter(s => s.type === 'friendship').length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ChevronLeft size={20} />
              <span>Voltar</span>
            </Button>
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
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-sm text-muted-foreground">
                Bem-vindo, <span className="text-foreground font-medium">{currentUser?.name || 'Usuário'}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 pt-20 flex flex-col">
        <div className="container mx-auto px-6 py-8 flex-1 flex flex-col">
          {/* Title Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-4xl font-bold text-foreground">Participantes</h1>
              <p className="text-muted-foreground mt-2">Veja quem mais está participando</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total de participantes</p>
              <p className="text-4xl font-bold text-gold">{filteredParticipants.length}</p>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-muted/30 rounded-xl p-6 mb-8 border border-border">
            <h3 className="text-sm font-semibold text-foreground mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sort By */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'original')}
                  className="px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                >
                  <option value="original">Ordem Original</option>
                  <option value="name">Ordem Alfabética (A-Z)</option>
                </select>
              </div>

              {/* Gender Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">Filtrar por Gênero</label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value as 'all' | 'M' | 'F' | 'Outro')}
                  className="px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                >
                  <option value="all">Todos os Gêneros</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>

            {/* Active Filters Badge */}
            {(sortBy !== 'original' || genderFilter !== 'all') && (
              <div className="mt-4 flex flex-wrap gap-2">
                {sortBy !== 'original' && (
                  <div className="bg-gold/20 text-gold px-3 py-1 rounded-full text-xs font-medium">
                    Ordenado alfabeticamente
                  </div>
                )}
                {genderFilter !== 'all' && (
                  <div className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-xs font-medium">
                    {genderFilter === 'M' ? 'Masculino' : genderFilter === 'F' ? 'Feminino' : 'Outro'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Grid of Participant Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
            {filteredParticipants.map((participant) => {
              const selection = selections.find(s => s.userId === participant.id);
              const isMatched = selection?.type === 'match';
              const isFriend = selection?.type === 'friendship';
              const isNoInterest = selection?.type === 'no-interest';

              return (
                <div
                  key={participant.id}
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow flex flex-col h-full"
                >
                  {/* Image Section */}
                  <div className="relative w-full bg-gradient-to-br from-amber-100 to-amber-200 aspect-square flex items-center justify-center overflow-hidden">
                    {participant.profileImage ? (
                      <img
                        src={participant.profileImage}
                        alt={participant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-6xl font-bold text-amber-300/80">
                        {participant.name?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-5 flex-1 flex flex-col">
                    {/* User Info */}
                    <div className="mb-4">
                      <h3 className="font-serif text-xl font-bold text-foreground">
                        {participant.username || 'Usuário'}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {getGenderLabel(participant.gender)}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 mt-auto">
                      <Button
                        onClick={() => handleSelection(participant.id, 'match')}
                        className={`w-full py-2 text-sm font-medium transition-all ${
                          isMatched
                            ? 'bg-rose-200 text-rose-900 hover:bg-rose-300'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                        variant="outline"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Match
                      </Button>
                      <Button
                        onClick={() => handleSelection(participant.id, 'friendship')}
                        className={`w-full py-2 text-sm font-medium transition-all ${
                          isFriend
                            ? 'bg-blue-200 text-blue-900 hover:bg-blue-300'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                        variant="outline"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Amizade
                      </Button>
                      <Button
                        onClick={() => handleSelection(participant.id, 'no-interest')}
                        className={`w-full py-2 text-sm font-medium transition-all ${
                          isNoInterest
                            ? 'bg-red-200 text-red-900 hover:bg-red-300'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                        variant="outline"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Sem Interesse
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Finish Button */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">Seleções feitas</p>
              <p className="text-2xl font-bold text-foreground">
                {matchCount} <span className="text-rose-500">♥</span> {friendshipCount} <span className="text-blue-500">👥</span>
              </p>
            </div>
            <Button
              onClick={handleFinish}
              variant="hero"
              className="px-8 py-3 text-base"
              disabled={selections.length === 0}
            >
              Finalizar Seleção ({selections.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
