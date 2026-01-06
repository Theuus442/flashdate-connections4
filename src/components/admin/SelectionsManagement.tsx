import { useSelections } from '@/context/SelectionsContext';
import { useUsers } from '@/context/UsersContext';
import { Heart, Users, X } from 'lucide-react';

export const SelectionsManagement = () => {
  const { getSelectionsByType } = useSelections();
  const { users } = useUsers();

  const matches = getSelectionsByType('match');
  const friendships = getSelectionsByType('friendship');
  const noInterests = getSelectionsByType('no-interest');

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
    selections: Array<{ userId: string; type: string }>;
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
              key={selection.userId}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                title === 'Matches'
                  ? 'bg-gold/10 border-gold/20'
                  : title === 'Amizades'
                  ? 'bg-secondary/10 border-secondary/20'
                  : 'bg-destructive/10 border-destructive/20'
              }`}
            >
              <span className="text-sm font-medium text-foreground">
                {getUserName(selection.userId)}
              </span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${color}`}>
                {title === 'Matches'
                  ? '💕 Match'
                  : title === 'Amizades'
                  ? '👥 Amizade'
                  : '❌ Sem Interesse'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const totalSelections = matches.length + friendships.length + noInterests.length;

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
          <p className="text-xs text-muted-foreground mb-1">Matches</p>
          <p className="text-3xl font-bold text-gold">{matches.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Amizades</p>
          <p className="text-3xl font-bold text-secondary">{friendships.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Sem Interesse</p>
          <p className="text-3xl font-bold text-destructive">{noInterests.length}</p>
        </div>
      </div>

      {/* Selection Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <SelectionCard
          icon={Heart}
          title="Matches"
          count={matches.length}
          selections={matches}
          color="text-gold"
        />
        <SelectionCard
          icon={Users}
          title="Amizades"
          count={friendships.length}
          selections={friendships}
          color="text-secondary"
        />
        <SelectionCard
          icon={X}
          title="Sem Interesse"
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
            {/* Matches Detail */}
            {matches.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Heart size={20} className="text-gold" />
                  Matches ({matches.length})
                </h3>
                <div className="space-y-2 ml-6">
                  {matches.map(match => (
                    <div key={match.userId} className="text-sm text-foreground">
                      💕 <span className="font-medium">{getUserName(match.userId)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Friendships Detail */}
            {friendships.length > 0 && (
              <div className={matches.length > 0 ? 'pt-6 border-t border-border' : ''}>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Users size={20} className="text-secondary" />
                  Amizades ({friendships.length})
                </h3>
                <div className="space-y-2 ml-6">
                  {friendships.map(friendship => (
                    <div key={friendship.userId} className="text-sm text-foreground">
                      👥 <span className="font-medium">{getUserName(friendship.userId)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Interest Detail */}
            {noInterests.length > 0 && (
              <div
                className={
                  matches.length > 0 || friendships.length > 0
                    ? 'pt-6 border-t border-border'
                    : ''
                }
              >
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <X size={20} className="text-destructive" />
                  Sem Interesse ({noInterests.length})
                </h3>
                <div className="space-y-2 ml-6">
                  {noInterests.map(noInterest => (
                    <div key={noInterest.userId} className="text-sm text-foreground">
                      ❌ <span className="font-medium">{getUserName(noInterest.userId)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalSelections === 0 && (
        <div className="text-center py-12 bg-card border border-border rounded-2xl">
          <p className="text-muted-foreground">Nenhuma seleção feita ainda</p>
        </div>
      )}
    </div>
  );
};
