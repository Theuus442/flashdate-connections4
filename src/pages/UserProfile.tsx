import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Users, X, LogOut, Camera, ChevronDown, ChevronUp, UserCircle2, XCircle, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useUsers, type User } from '@/context/UsersContext';
import { useSelections } from '@/context/SelectionsContext';

export default function UserProfile() {
  const navigate = useNavigate();
  const { users: allUsers, updateUser } = useUsers();
  const { updateSelection, getSelectionsByType } = useSelections();

  // Use the first user as the current user (in a real app, this would be the logged-in user)
  const currentUser = useMemo(() => allUsers[0] || null, [allUsers]);

  const [imagePreview, setImagePreview] = useState<string | undefined>(currentUser?.profileImage);
  const [showSelectionsDetail, setShowSelectionsDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'participants' | 'matches' | 'profile'>('participants');

  // Filter users excluding the current user
  const otherUsers = useMemo(() => 
    currentUser ? allUsers.filter(user => user.id !== currentUser.id) : allUsers,
    [currentUser, allUsers]
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setImagePreview(imageUrl);
        const updatedUser = { ...currentUser, profileImage: imageUrl };
        updateUser(currentUser.id, updatedUser);
        toast.success('Foto atualizada com sucesso!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    if (currentUser) {
      setImagePreview(undefined);
      const updatedUser = { ...currentUser, profileImage: undefined };
      updateUser(currentUser.id, updatedUser);
      toast.success('Foto removida');
    }
  };

  const handleSelection = (userId: string, type: 'match' | 'friendship' | 'no-interest') => {
    updateSelection(userId, type);
  };

  const matchCount = getSelectionsByType('match').length;
  const friendshipCount = getSelectionsByType('friendship').length;
  const allSelections = getSelectionsByType('match').concat(
    getSelectionsByType('friendship'),
    getSelectionsByType('no-interest')
  );

  const getSelectionForUser = (userId: string) => {
    return allSelections.find(s => s.userId === userId);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Nenhum usuário disponível</p>
          <Button onClick={() => navigate('/')} variant="gold">Voltar à Página Inicial</Button>
        </div>
      </div>
    );
  }

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
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 pt-20 flex flex-col">
        <div className="container mx-auto px-6 py-8 flex-1 flex flex-col">
          {/* Page Header with Tabs */}
          <div className="mb-8">
            <div className="mb-8">
              <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
                {activeTab === 'participants' ? 'Participantes' : activeTab === 'matches' ? 'Meus Matches' : 'Meu Perfil'}
              </h1>
              <p className="text-muted-foreground">
                {activeTab === 'participants'
                  ? 'Veja quem mais está participando do evento'
                  : activeTab === 'matches'
                  ? `Você tem ${matchCount} ${matchCount === 1 ? 'match' : 'matches'}`
                  : 'Visualize e atualize suas informações'}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-border overflow-x-auto">
              <button
                onClick={() => setActiveTab('participants')}
                className={`px-4 py-3 font-medium transition-all relative whitespace-nowrap ${
                  activeTab === 'participants'
                    ? 'text-gold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Participantes ({otherUsers.length})
                {activeTab === 'participants' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('matches')}
                className={`px-4 py-3 font-medium transition-all relative whitespace-nowrap ${
                  activeTab === 'matches'
                    ? 'text-gold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Matches ({matchCount})
                {activeTab === 'matches' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-3 font-medium transition-all relative whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'text-gold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Meu Perfil
                {activeTab === 'profile' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                )}
              </button>
            </div>
          </div>

          {/* Participants View */}
          {activeTab === 'participants' && (
            <div className="flex-1 flex flex-col">
              <div className="space-y-3">
                {otherUsers.map(user => {
                  const selection = getSelectionForUser(user.id);
                  return (
                    <div
                      key={user.id}
                      className={`bg-card border-2 rounded-xl overflow-hidden transition-all ${
                        selection
                          ? selection.type === 'match'
                            ? 'border-gold shadow-lg shadow-gold/20'
                            : selection.type === 'friendship'
                            ? 'border-secondary shadow-lg shadow-secondary/20'
                            : 'border-destructive/50'
                          : 'border-border hover:border-gold/50'
                      }`}
                    >
                      {/* Main Card Content */}
                      <div className="flex flex-col sm:flex-row items-stretch">
                        {/* User Image and Name */}
                        <div className="flex sm:flex-col items-center justify-start gap-3 sm:gap-0 px-3 sm:px-4 py-3 sm:py-4 bg-gradient-to-br from-gold/10 to-transparent sm:w-32 flex-shrink-0">
                          <div className="relative w-16 sm:w-20 h-16 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                            {user.profileImage ? (
                              <img
                                src={user.profileImage}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <UserCircle2 size={32} className="sm:w-12 sm:h-12 text-gold/30" />
                              </div>
                            )}
                          </div>
                          <div className="sm:text-center">
                            <h3 className="font-semibold text-foreground text-sm">{user.name}</h3>
                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex-1 flex items-center justify-around sm:justify-start px-2 sm:px-4 py-2 sm:py-4 gap-1 sm:gap-4">
                          <button
                            onClick={() => handleSelection(user.id, 'match')}
                            className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-full transition-all flex-shrink-0 ${
                              selection?.type === 'match'
                                ? 'ring-3 ring-gold ring-offset-2 ring-offset-background'
                                : 'hover:ring-2 hover:ring-gold/50 hover:ring-offset-2 hover:ring-offset-background'
                            }`}
                            title="Match"
                          >
                            <Heart size={18} className={`sm:w-6 sm:h-6 ${selection?.type === 'match' ? 'text-gold fill-gold' : 'text-foreground'}`} />
                            <span className="text-xs font-medium mt-0.5 sm:mt-1">Match</span>
                          </button>
                          <button
                            onClick={() => handleSelection(user.id, 'friendship')}
                            className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-full transition-all flex-shrink-0 ${
                              selection?.type === 'friendship'
                                ? 'ring-3 ring-secondary ring-offset-2 ring-offset-background'
                                : 'hover:ring-2 hover:ring-secondary/50 hover:ring-offset-2 hover:ring-offset-background'
                            }`}
                            title="Amizade"
                          >
                            <Users size={18} className={`sm:w-6 sm:h-6 ${selection?.type === 'friendship' ? 'text-secondary fill-secondary' : 'text-foreground'}`} />
                            <span className="text-xs font-medium mt-0.5 sm:mt-1">Amigos</span>
                          </button>
                          <button
                            onClick={() => handleSelection(user.id, 'no-interest')}
                            className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-full transition-all flex-shrink-0 ${
                              selection?.type === 'no-interest'
                                ? 'ring-3 ring-destructive ring-offset-2 ring-offset-background'
                                : 'hover:ring-2 hover:ring-destructive/50 hover:ring-offset-2 hover:ring-offset-background'
                            }`}
                            title="Não faz meu tipo"
                          >
                            <X size={18} className={`sm:w-6 sm:h-6 ${selection?.type === 'no-interest' ? 'text-destructive' : 'text-foreground'}`} />
                            <span className="text-xs font-medium mt-0.5 sm:mt-1">Não meu tipo</span>
                          </button>
                        </div>
                      </div>

                      {/* Contact Info Below Actions */}
                      <div className="border-t border-border bg-muted/30 px-3 sm:px-4 py-2 sm:py-3 text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail size={14} />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} />
                          <span>{user.whatsapp}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty State */}
              {otherUsers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhum participante disponível no momento</p>
                </div>
              )}
            </div>
          )}

          {/* Profile View */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto w-full">
              <div className="bg-card border border-border rounded-2xl p-8">
                {/* Profile Image Section */}
                <div className="mb-8">
                  <h3 className="font-serif text-xl font-bold text-foreground mb-4">Sua Foto</h3>
                  {imagePreview ? (
                    <div className="relative w-full max-w-sm aspect-square rounded-xl border border-border overflow-hidden bg-muted/30 mb-4 mx-auto">
                      <img
                        src={imagePreview}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-destructive/90 hover:bg-destructive text-white p-2 rounded-lg transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full max-w-sm aspect-square rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center mb-4 mx-auto">
                      <div className="text-center">
                        <UserCircle2 size={80} className="text-gold/30 mb-2 mx-auto" />
                        <p className="text-sm text-muted-foreground">Sem foto ainda</p>
                      </div>
                    </div>
                  )}

                  <label className="flex items-center justify-center w-full max-w-sm mx-auto px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-gold transition-colors bg-muted/30">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Camera className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">Adicionar foto</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Profile Info */}
                <div className="border-t border-border pt-8">
                  <h3 className="font-serif text-xl font-bold text-foreground mb-6">Suas Informações</h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Nome Completo</p>
                      <p className="text-lg font-semibold text-foreground">{currentUser.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Apelido/Username</p>
                      <p className="text-lg font-semibold text-foreground">@{currentUser.username}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Email</p>
                      <p className="text-lg font-semibold text-foreground">{currentUser.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Telefone (WhatsApp)</p>
                      <p className="text-lg font-semibold text-foreground">{currentUser.whatsapp}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-8 pt-8 border-t border-border grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase">Matches</p>
                      <p className="text-3xl font-bold text-gold">{matchCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase">Amizades</p>
                      <p className="text-3xl font-bold text-secondary">{friendshipCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase">Seleções</p>
                      <p className="text-3xl font-bold text-foreground">{allSelections.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Matches View */}
          {activeTab === 'matches' && (
            <div className="flex-1 flex flex-col">
              {getSelectionsByType('match').length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {getSelectionsByType('match').map(sel => {
                    const user = allUsers.find(u => u.id === sel.userId);
                    if (!user) return null;
                    return (
                      <div
                        key={user.id}
                        className="bg-card border-2 border-gold rounded-2xl overflow-hidden shadow-lg shadow-gold/20"
                      >
                        {/* User Image */}
                        <div className="relative w-full h-48 bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center overflow-hidden">
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserCircle2 size={100} className="text-gold/30" />
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="text-white text-center">
                              <Heart size={40} className="mb-2 mx-auto" fill="white" />
                              <p className="text-xs font-medium">Match</p>
                            </div>
                          </div>
                        </div>

                        {/* User Info */}
                        <div className="p-4">
                          <div className="mb-4">
                            <h3 className="font-semibold text-foreground text-lg">{user.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              @{user.username}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground mb-4">
                            📧 {user.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            📱 {user.whatsapp}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 flex-1 flex items-center justify-center">
                  <div>
                    <Heart size={64} className="text-gold/30 mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">Nenhum match ainda</p>
                    <p className="text-muted-foreground text-sm mt-2">Comece a fazer conexões selecionando "Match" com outros participantes</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
