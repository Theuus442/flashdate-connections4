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
  gender: 'M' | 'F' | 'Outro';
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
      gender: 'M',
      profession: 'Engenheiro de Software',
      bio: 'Apaixonado por viagens e livros',
      interests: ['Viagens', 'Leitura', 'Tecnologia'],
    },
    {
      id: '2',
      name: 'Ana Costa',
      age: 28,
      gender: 'F',
      profession: 'Designer Gráfico',
      bio: 'Amante de arte e cultura',
      interests: ['Arte', 'Museu', 'Cinema'],
    },
    {
      id: '3',
      name: 'Carlos Mendes',
      age: 38,
      gender: 'M',
      profession: 'Médico',
      bio: 'Esportista nas horas vagas',
      interests: ['Esportes', 'Natureza', 'Culinária'],
    },
    {
      id: '4',
      name: 'Beatriz Lima',
      age: 30,
      gender: 'F',
      profession: 'Psicóloga',
      bio: 'Apaixonada por desenvolvimento pessoal',
      interests: ['Meditação', 'Yoga', 'Desenvolvimento'],
    },
    {
      id: '5',
      name: 'Roberto Alves',
      age: 36,
      gender: 'M',
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

          {/* Main Card */}
          <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg flex flex-col h-full">
              {/* Image Section */}
              <div className="relative w-full bg-gradient-to-br from-amber-100 to-amber-200 aspect-square flex items-center justify-center">
                {currentParticipant.profileImage ? (
                  <img
                    src={currentParticipant.profileImage}
                    alt={currentParticipant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-9xl font-bold text-amber-300/80">
                    {currentParticipant.name.charAt(0)}
                  </span>
                )}
              </div>

              {/* Content Section */}
              <div className="p-8 flex-1 flex flex-col">
                {/* User Info */}
                <div className="mb-8">
                  <h2 className="font-serif text-3xl font-bold text-foreground">
                    {currentParticipant.name}
                  </h2>
                  <p className="text-lg text-muted-foreground mt-1">
                    {currentParticipant.age} anos • {currentParticipant.gender === 'M' ? 'Masculino' : currentParticipant.gender === 'F' ? 'Feminino' : 'Outro'} • {currentParticipant.profession}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mt-auto">
                  <Button
                    onClick={() => handleSelection('match')}
                    className={`w-full py-3 text-base font-medium transition-all ${
                      currentSelection?.type === 'match'
                        ? 'bg-blue-200 text-blue-900 hover:bg-blue-300'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-150'
                    }`}
                    variant="outline"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Match
                  </Button>
                  <Button
                    onClick={() => handleSelection('friendship')}
                    className={`w-full py-3 text-base font-medium transition-all ${
                      currentSelection?.type === 'friendship'
                        ? 'bg-blue-200 text-blue-900 hover:bg-blue-300'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-150'
                    }`}
                    variant="outline"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Amizade
                  </Button>
                  <Button
                    onClick={() => handleSelection('no-interest')}
                    className={`w-full py-3 text-base font-medium transition-all ${
                      currentSelection?.type === 'no-interest'
                        ? 'bg-blue-200 text-blue-900 hover:bg-blue-300'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-150'
                    }`}
                    variant="outline"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Sem Interesse
                  </Button>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between mt-8 gap-4 px-8 pb-8">
                <Button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  variant="outline"
                  size="lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                <div className="flex-1 text-center">
                  <p className="text-sm text-muted-foreground">
                    {currentIndex + 1} de {participants.length}
                  </p>
                </div>

                <Button
                  onClick={handleNext}
                  disabled={currentIndex === participants.length - 1}
                  variant="outline"
                  size="lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Finish Button */}
              <div className="px-8 pb-8">
                <Button
                  onClick={handleFinish}
                  variant="hero"
                  className="w-full py-3 text-base"
                  disabled={selections.length === 0}
                >
                  Finalizar Seleção ({selections.length})
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
