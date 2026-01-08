import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Heart, Users, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface Participant {
  id: string;
  name: string;
  age: number;
  profession: string;
  profileImage?: string;
  bio?: string;
  interests?: string[];
}

interface Selection {
  userId: string;
  type: 'match' | 'friendship' | 'no-interest';
}

export default function EventUserSelection() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  // Mock current user (from admin dashboard)
  const currentUser = {
    id: 'current-user',
    name: 'Maria Silva',
    age: 32,
    email: 'maria@example.com',
    profileImage: undefined,
  };

  // Mock participant data
  const participants: Participant[] = [
    {
      id: '1',
      name: 'João Santos',
      age: 35,
      profession: 'Engenheiro de Software',
      bio: 'Apaixonado por viagens e livros',
      interests: ['Viagens', 'Leitura', 'Tecnologia'],
    },
    {
      id: '2',
      name: 'Ana Costa',
      age: 28,
      profession: 'Designer Gráfico',
      bio: 'Amante de arte e cultura',
      interests: ['Arte', 'Museu', 'Cinema'],
    },
    {
      id: '3',
      name: 'Carlos Mendes',
      age: 38,
      profession: 'Médico',
      bio: 'Esportista nas horas vagas',
      interests: ['Esportes', 'Natureza', 'Culinária'],
    },
    {
      id: '4',
      name: 'Beatriz Lima',
      age: 30,
      profession: 'Psicóloga',
      bio: 'Apaixonada por desenvolvimento pessoal',
      interests: ['Meditação', 'Yoga', 'Desenvolvimento'],
    },
    {
      id: '5',
      name: 'Roberto Alves',
      age: 36,
      profession: 'Advogado',
      bio: 'Gosto de coisas simples e boas',
      interests: ['Culinária', 'Vinho', 'Filosofia'],
    },
  ];

  const currentParticipant = participants[currentIndex];
  const isSelected = selections.some(s => s.userId === currentParticipant.id);
  const currentSelection = selections.find(s => s.userId === currentParticipant.id);

  const handleSelection = (type: 'match' | 'friendship' | 'no-interest') => {
    if (isSelected) {
      // Update existing selection
      setSelections(selections.map(s =>
        s.userId === currentParticipant.id ? { ...s, type } : s
      ));
    } else {
      // Add new selection
      setSelections([...selections, { userId: currentParticipant.id, type }]);
    }

    // Move to next participant
    if (currentIndex < participants.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      toast.success('Seleções finalizadas!');
    }
  };

  const handleRemoveSelection = (userId: string) => {
    setSelections(selections.filter(s => s.userId !== userId));
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < participants.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleFinish = () => {
    if (selections.length === 0) {
      toast.error('Faça pelo menos uma seleção antes de finalizar');
      return;
    }
    toast.success(`Seleções finalizadas com sucesso! ${selections.length} pessoa(s) selecionada(s)`);
    navigate('/dashboard');
  };

  const matchCount = selections.filter(s => s.type === 'match').length;
  const friendshipCount = selections.filter(s => s.type === 'friendship').length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <a href="/" className="flex items-center gap-2">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F0b16f2a8970443a0b7d02d6ff7c28cc7%2F728ec6c60764404790cd1aae17f7869e?format=webp&width=800"
                alt="Flashdate Logo"
                className="h-16 w-auto"
              />
              <span className="hidden sm:inline font-bold text-lg text-foreground">
                FlashDate<span className="text-gold">⚡</span>
              </span>
            </a>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-sm text-muted-foreground">
                Bem-vindo, <span className="text-foreground font-medium">{currentUser.name}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 pt-20 flex flex-col">
        <div className="container mx-auto px-6 py-8 flex-1 flex flex-col">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Seleção de Participantes</h1>
            <p className="text-muted-foreground">
              Indique seu interesse: Match, Amizade ou Não Tenho Interesse
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Matches</p>
              <p className="text-2xl font-bold text-gold">{matchCount}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Amizades</p>
              <p className="text-2xl font-bold text-secondary">{friendshipCount}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Visitados</p>
              <p className="text-2xl font-bold text-foreground">{currentIndex + 1}/{participants.length}</p>
            </div>
          </div>

          {/* Toggle View Mode */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'cards'
                  ? 'bg-gold text-secondary-foreground'
                  : 'bg-card border border-border text-foreground hover:border-gold'
              }`}
            >
              Visualização Cards
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-gold text-secondary-foreground'
                  : 'bg-card border border-border text-foreground hover:border-gold'
              }`}
            >
              Visualização Lista
            </button>
          </div>

          {/* Main Content */}
          {viewMode === 'cards' ? (
            <div className="flex-1 flex flex-col">
              {/* Card View */}
              <div className="grid md:grid-cols-3 gap-8 flex-1">
                {/* Participant Card */}
                <div className="md:col-span-2">
                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg flex flex-col h-full">
                    {/* Image */}
                    <div className="relative w-full bg-gradient-to-br from-gold to-gold-dark aspect-video flex items-center justify-center">
                      {currentParticipant.profileImage ? (
                        <img
                          src={currentParticipant.profileImage}
                          alt={currentParticipant.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-8xl font-bold text-secondary-foreground opacity-50">
                          {currentParticipant.name.charAt(0)}
                        </span>
                      )}

                      {/* Progress Indicator */}
                      <div className="absolute top-4 right-4 bg-black/50 rounded-full px-4 py-2 text-white text-sm font-medium">
                        {currentIndex + 1}/{participants.length}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="mb-6">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h2 className="font-serif text-3xl font-bold text-foreground">
                              {currentParticipant.name}
                            </h2>
                            <p className="text-lg text-muted-foreground">{currentParticipant.age} anos</p>
                          </div>
                        </div>
                        <p className="text-secondary font-medium mb-3">{currentParticipant.profession}</p>
                        {currentParticipant.bio && (
                          <p className="text-foreground leading-relaxed mb-4">{currentParticipant.bio}</p>
                        )}
                        {currentParticipant.interests && currentParticipant.interests.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {currentParticipant.interests.map(interest => (
                              <span
                                key={interest}
                                className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-sm font-medium"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3 mt-auto border-t border-border pt-6">
                        <Button
                          onClick={() => handleSelection('match')}
                          variant={currentSelection?.type === 'match' ? 'gold' : 'outline'}
                          className="w-full"
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          {currentSelection?.type === 'match' ? 'Match Selecionado' : 'Match'}
                        </Button>
                        <Button
                          onClick={() => handleSelection('friendship')}
                          variant={currentSelection?.type === 'friendship' ? 'secondary' : 'outline'}
                          className="w-full"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          {currentSelection?.type === 'friendship' ? 'Amizade Selecionada' : 'Amizade'}
                        </Button>
                        <Button
                          onClick={() => handleSelection('no-interest')}
                          variant={currentSelection?.type === 'no-interest' ? 'destructive' : 'outline'}
                          className="w-full"
                        >
                          <X className="w-4 h-4 mr-2" />
                          {currentSelection?.type === 'no-interest' ? 'Não Interessado' : 'Não Tenho Interesse'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar with Navigation */}
                <div className="flex flex-col gap-4">
                  {/* Navigation Buttons */}
                  <div className="space-y-2">
                    <Button
                      onClick={handlePrevious}
                      disabled={currentIndex === 0}
                      variant="outline"
                      className="w-full"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Anterior
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={currentIndex === participants.length - 1}
                      variant="outline"
                      className="w-full"
                    >
                      Próximo
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>

                  {/* Quick List */}
                  <div className="bg-card border border-border rounded-xl p-4 flex-1">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Users size={16} />
                      Selecionados
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {selections.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhum selecionado ainda
                        </p>
                      ) : (
                        selections.map(selection => {
                          const participant = participants.find(p => p.id === selection.userId);
                          return (
                            <div
                              key={selection.userId}
                              className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                                selection.type === 'match'
                                  ? 'bg-gold/20 border border-gold'
                                  : selection.type === 'friendship'
                                  ? 'bg-secondary/20 border border-secondary'
                                  : 'bg-destructive/20 border border-destructive'
                              }`}
                            >
                              <span className="font-medium text-foreground">{participant?.name}</span>
                              <button
                                onClick={() => handleRemoveSelection(selection.userId)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Finish Button */}
                  <Button
                    onClick={handleFinish}
                    variant="hero"
                    className="w-full"
                    disabled={selections.length === 0}
                  >
                    Finalizar Seleção
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // List View
            <div className="flex-1">
              <div className="grid grid-cols-3 gap-4 mb-8">
                {participants.map((participant, index) => {
                  const selection = selections.find(s => s.userId === participant.id);
                  return (
                    <div
                      key={participant.id}
                      onClick={() => setCurrentIndex(index)}
                      className={`bg-card border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        currentIndex === index
                          ? 'border-gold shadow-lg'
                          : selection
                          ? selection.type === 'match'
                            ? 'border-gold/50'
                            : selection.type === 'friendship'
                            ? 'border-secondary/50'
                            : 'border-destructive/50'
                          : 'border-border hover:border-gold/30'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="w-full aspect-square bg-gradient-to-br from-gold to-gold-dark rounded-lg flex items-center justify-center mb-4">
                        {participant.profileImage ? (
                          <img
                            src={participant.profileImage}
                            alt={participant.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-5xl font-bold text-secondary-foreground opacity-50">
                            {participant.name.charAt(0)}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <h3 className="font-semibold text-foreground">{participant.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {participant.age} anos • {participant.profession}
                      </p>

                      {/* Status Badge */}
                      {selection && (
                        <div className={`mt-3 px-3 py-1 rounded text-xs font-medium text-center ${
                          selection.type === 'match'
                            ? 'bg-gold/20 text-gold'
                            : selection.type === 'friendship'
                            ? 'bg-secondary/20 text-secondary'
                            : 'bg-destructive/20 text-destructive'
                        }`}>
                          {selection.type === 'match' && '💕 Match'}
                          {selection.type === 'friendship' && '👥 Amizade'}
                          {selection.type === 'no-interest' && '❌ Sem Interesse'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Finish Button */}
              <Button
                onClick={handleFinish}
                variant="hero"
                className="w-full"
                disabled={selections.length === 0}
                size="lg"
              >
                Finalizar Seleção ({selections.length})
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
