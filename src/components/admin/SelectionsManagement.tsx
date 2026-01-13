import { useEffect, useState } from 'react';
import { useUsers } from '@/context/UsersContext';
import { Heart, Users, X } from 'lucide-react';
import { selectionsService } from '@/lib/selections.service';
import { Selection } from '@/context/SelectionsContext';

export const SelectionsManagement = () => {
  const { users } = useUsers();
  const [selections, setSelections] = useState<Selection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all selections from database on mount
  useEffect(() => {
    const loadSelections = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await selectionsService.getSelections();
        if (error) {
          console.error('Error loading selections:', error);
          setSelections([]);
        } else if (data) {
          setSelections(data);
        }
      } catch (error) {
        console.error('Error loading selections:', error);
        setSelections([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSelections();
  }, []);

  const getSelectionsByVote = (vote: 'SIM' | 'TALVEZ' | 'NÃO') => {
    return selections.filter(s => s.vote === vote).map(s => ({
      selectedUserId: s.selectedUserId,
      vote: s.vote,
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
          {selections.map(selection => (
            <div
              key={selection.selectedUserId}
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

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-4">
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
      {totalSelections > 0 && (
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
                  {matches.map(match => (
                    <div key={match.selectedUserId} className="text-sm text-foreground">
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
                  {maybe.map(m => (
                    <div key={m.selectedUserId} className="text-sm text-foreground">
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
                  {noInterests.map(noInterest => (
                    <div key={noInterest.selectedUserId} className="text-sm text-foreground">
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
