import { useState, useEffect } from 'react';
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
  const { users, isLoading } = useUsers();
  const [selections, setSelections] = useState<Selection[]>([]);
  const [participants, setParticipants] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Show loading state only if truly loading and no data yet
  if (isLoading && participants.length === 0 && !currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando participantes...</p>
        </div>
      </div>
    );
  }

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

  // Load current user and participants from database
  useEffect(() => {
    if (!authUser || !users.length) return;

    console.log('[EventUserSelection] Loading data...');

    // Get current user from users array
    const user = users.find(u => u.id === authUser.id);
    if (user) {
      console.log('[EventUserSelection] Current user loaded:', user.name);
      setCurrentUser(user);
    }

    // Get other participants (excluding current user and admin users)
    const otherUsers = users.filter(u => u.id !== authUser.id && u.role === 'client');
    console.log('[EventUserSelection] Participants loaded:', otherUsers.length);
    setParticipants(otherUsers);

    if (otherUsers.length === 0) {
      toast.warning('Nenhum outro participante disponível');
    }
  }, [authUser, users]);

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
              <p className="text-4xl font-bold text-gold">{participants.length}</p>
            </div>
          </div>

          {/* Grid of Participant Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
            {participants.map((participant) => {
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
                        {participant.name || 'Usuário'}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {participant.age || '-'} anos • {getGenderLabel(participant.gender)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {participant.profession || '-'}
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
