import { useEffect, useState } from 'react';
import { useUsers } from '@/context/UsersContext';
import { Heart, Users, X, Zap, ArrowRightLeft } from 'lucide-react';
import { selectionsService } from '@/lib/selections.service';
import { Selection } from '@/context/SelectionsContext';

interface MutualMatch {
  userId: string;
  selectedUserId: string;
  matchType: 'MATCH' | 'AMIZADE';
  createdAt: string;
}

export const SelectionsManagement = () => {
  const { users } = useUsers();
  const [selections, setSelections] = useState<Selection[]>([]);
  const [mutualMatches, setMutualMatches] = useState<MutualMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Load all selections from database on mount
  useEffect(() => {
    const loadSelections = async () => {
      setIsLoading(true);
      try {
        // Load all selections
        const { data: selectionsData, error: selectionsError } = await selectionsService.getSelections();
        if (selectionsError) {
          console.error('Error loading selections:', selectionsError);
          setSelections([]);
        } else if (selectionsData) {
          setSelections(selectionsData);
        }

        // Load mutual matches
        const { data: mutualData, error: mutualError } = await selectionsService.getMutualMatches();
        if (mutualError) {
          console.error('Error loading mutual matches:', mutualError);
          setMutualMatches([]);
        } else if (mutualData) {
          setMutualMatches(mutualData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setSelections([]);
        setMutualMatches([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSelections();
  }, []);

  const isMutualMatch = (userId: string, selectedUserId: string): boolean => {
    return mutualMatches.some(
      m => (m.userId === userId && m.selectedUserId === selectedUserId) ||
           (m.userId === selectedUserId && m.selectedUserId === userId)
    );
  };

  const getSelectionsByVote = (vote: 'SIM' | 'TALVEZ' | 'NÃO') => {
    let filtered = selections.filter(s => s.vote === vote);

    // If a user is selected, only show their selections
    if (selectedUserId) {
      filtered = filtered.filter(s => s.userId === selectedUserId);
    }

    return filtered.map(s => ({
      id: s.id,
      eventId: s.eventId,
      selectedUserId: s.selectedUserId,
      vote: s.vote,
      userId: s.userId,
    }));
  };

  const matches = getSelectionsByVote('SIM');
  const maybe = getSelectionsByVote('TALVEZ');
  const noInterests = getSelectionsByVote('NÃO');

  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || 'Usuário desconhecido';
  };

  const SelectionCard = ({
    icon: Icon,
    title,
    count,
    selections,
    color,
  }: {
    icon: React.ComponentType<{ size: number }>;
    title: string;
    count: number;
    selections: Array<{ selectedUserId: string; vote: string }>;
    color: string;
  }) => (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <Icon size={24} className={color} />
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className={`text-sm font-bold ${color}`}>{count} seleção(ões)</p>
        </div>
      </div>

      {selections.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhuma seleção deste tipo ainda
        </p>
      ) : (
        <div className="space-y-2">
          {selections.map((selection, index) => (
            <div
              key={selection.id || `${selection.eventId}-${selection.userId}-${selection.selectedUserId}-${index}`}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                title === 'SIM'
                  ? 'bg-gold/10 border-gold/20'
                  : title === 'TALVEZ'
                  ? 'bg-secondary/10 border-secondary/20'
                  : 'bg-destructive/10 border-destructive/20'
              }`}
            >
              <span className="text-sm font-medium text-foreground">
                {getUserName(selection.selectedUserId)}
              </span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${color}`}>
                {title === 'SIM'
                  ? '💕 SIM'
                  : title === 'TALVEZ'
                  ? '👥 TALVEZ'
                  : '❌ NÃO'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const totalSelections = matches.length + maybe.length + noInterests.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Seleções de Usuários
            </h1>
            <p className="text-muted-foreground mt-2">
              Visualize todos os matches, amizades e desinteresses
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Total de Seleções</p>
            <p className="text-3xl font-bold text-gold">{totalSelections}</p>
          </div>
        </div>

        {/* User Filter */}
        <div className="bg-card border border-border rounded-xl p-4">
          <label className="block text-sm font-medium text-foreground mb-3">
            Filtrar por Usuário
          </label>
          <select
            value={selectedUserId || ''}
            onChange={(e) => setSelectedUserId(e.target.value || null)}
            className="w-full max-w-md px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
          >
            <option value="">Todos os usuários</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          {selectedUserId && (
            <p className="text-xs text-muted-foreground mt-2">
              Mostrando seleções de: <span className="font-semibold text-foreground">{getUserName(selectedUserId)}</span>
            </p>
          )}
        </div>
      </div>

      {/* Mutual Matches Highlight */}
      {!isLoading && mutualMatches.length > 0 && (
        <div className="bg-gradient-to-r from-gold/10 to-gold-dark/10 border border-gold/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gold/20 mb-4">
            <div className="flex items-center gap-2 text-gold">
              <Zap size={24} className="animate-pulse-glow" />
              <h2 className="font-serif text-2xl font-bold">Matches e Amizades Mútuos Confirmados</h2>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {mutualMatches.length} par{mutualMatches.length !== 1 ? 'es de' : ''} pessoas encontraram um ao outro! 💕
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {mutualMatches.map((match) => {
              const user1 = users.find(u => u.id === match.userId);
              const user2 = users.find(u => u.id === match.selectedUserId);
              const isMatch = match.matchType === 'MATCH';
              const borderColor = isMatch ? 'border-gold/30 hover:border-gold/50' : 'border-emerald/30 hover:border-emerald/50';
              const bgColor = isMatch ? 'bg-gold/10' : 'bg-emerald/10';
              const textColor = isMatch ? 'text-gold' : 'text-emerald';
              return (
                <div
                  key={`${match.userId}-${match.selectedUserId}`}
                  className={`flex items-center justify-between p-3 rounded-lg bg-card border ${borderColor} transition-colors`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">
                      {user1?.name || 'Usuário desconhecido'}
                    </span>
                    <ArrowRightLeft size={18} className={textColor} flex-shrink-0 />
                    <span className="text-sm font-medium text-foreground truncate">
                      {user2?.name || 'Usuário desconhecido'}
                    </span>
                  </div>
                  <span className={`ml-2 flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${bgColor} ${textColor}`}>
                    {isMatch ? '💕 Match' : '💫 Amizade'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">SIM</p>
          <p className="text-3xl font-bold text-gold">{matches.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">TALVEZ</p>
          <p className="text-3xl font-bold text-secondary">{maybe.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">NÃO</p>
          <p className="text-3xl font-bold text-destructive">{noInterests.length}</p>
        </div>
        <div className="bg-gradient-to-br from-gold/10 to-gold-dark/10 border border-gold/30 rounded-xl p-4">
          <p className="text-xs text-gold font-semibold mb-1">✨ MATCHES MÚTUOS</p>
          <p className="text-3xl font-bold text-gold">{mutualMatches.length}</p>
        </div>
      </div>

      {/* Selection Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <SelectionCard
          icon={Heart}
          title="SIM"
          count={matches.length}
          selections={matches}
          color="text-gold"
        />
        <SelectionCard
          icon={Users}
          title="TALVEZ"
          count={maybe.length}
          selections={maybe}
          color="text-secondary"
        />
        <SelectionCard
          icon={X}
          title="NÃO"
          count={noInterests.length}
          selections={noInterests}
          color="text-destructive"
        />
      </div>

      {/* Detailed View */}
      {!isLoading && totalSelections > 0 && (
        <div className="bg-card border border-border rounded-2xl p-8">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
            Lista Completa de Seleções
          </h2>

          <div className="space-y-6">
            {/* SIM Detail */}
            {matches.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Heart size={20} className="text-gold" />
                  SIM ({matches.length})
                </h3>
                <div className="space-y-2 ml-6">
                  {matches.map((match, index) => (
                    <div key={match.id || `${match.eventId}-${match.userId}-${match.selectedUserId}-SIM-${index}`} className="text-sm text-foreground">
                      💕 <span className="font-medium">{getUserName(match.selectedUserId)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TALVEZ Detail */}
            {maybe.length > 0 && (
              <div className={matches.length > 0 ? 'pt-6 border-t border-border' : ''}>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Users size={20} className="text-secondary" />
                  TALVEZ ({maybe.length})
                </h3>
                <div className="space-y-2 ml-6">
                  {maybe.map((m, index) => (
                    <div key={m.id || `${m.eventId}-${m.userId}-${m.selectedUserId}-TALVEZ-${index}`} className="text-sm text-foreground">
                      👥 <span className="font-medium">{getUserName(m.selectedUserId)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NÃO Detail */}
            {noInterests.length > 0 && (
              <div
                className={
                  matches.length > 0 || maybe.length > 0
                    ? 'pt-6 border-t border-border'
                    : ''
                }
              >
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <X size={20} className="text-destructive" />
                  NÃO ({noInterests.length})
                </h3>
                <div className="space-y-2 ml-6">
                  {noInterests.map((noInterest, index) => (
                    <div key={noInterest.id || `${noInterest.eventId}-${noInterest.userId}-${noInterest.selectedUserId}-NÃO-${index}`} className="text-sm text-foreground">
                      ❌ <span className="font-medium">{getUserName(noInterest.selectedUserId)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12 bg-card border border-border rounded-2xl">
          <p className="text-muted-foreground">Carregando seleções...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && totalSelections === 0 && (
        <div className="text-center py-12 bg-card border border-border rounded-2xl">
          <p className="text-muted-foreground">Nenhuma seleção feita ainda</p>
        </div>
      )}
    </div>
  );
};
