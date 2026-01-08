import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Users, X, LogOut, Camera, ChevronDown, ChevronUp, UserCircle2, MessageCircle, XCircle } from 'lucide-react';
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
                src="https://cdn.builder.io/api/v1/image/assets%2F73d680b1b3a649a9a5bc7e1247d963e4%2F685f0706602c47e4964899c8526c67cd?format=webp&width=800"
                alt="Flashdate Logo"
                className="h-10 w-auto"
              />
              <span className="hidden sm:inline font-bold text-lg text-foreground">
                Flash<span className="text-gold">⚡</span>Date
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
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Meu Perfil</h1>
            <p className="text-muted-foreground">
              Complete seu perfil e comece a fazer conexões
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-3 gap-8 flex-1">
            {/* Left Column: User Profile */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-2xl p-8 sticky top-24">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Seu Perfil</h2>

                {/* Profile Image Section */}
                <div className="mb-8">
                  {imagePreview ? (
                    <div className="relative w-full aspect-square rounded-xl border border-border overflow-hidden bg-muted/30 mb-4">
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
                    <div className="w-full aspect-square rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center mb-4">
                      <div className="text-center">
                        <UserCircle2 size={80} className="text-gold/30 mb-2 mx-auto" />
                        <p className="text-sm text-muted-foreground">Sem foto ainda</p>
                      </div>
                    </div>
                  )}

                  <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-gold transition-colors bg-muted/30">
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
                <div className="space-y-4 border-t border-border pt-6">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Nome Completo</p>
                    <p className="text-sm font-semibold text-foreground">{currentUser.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Apelido</p>
                    <p className="text-sm font-semibold text-foreground">{currentUser.username}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Email</p>
                    <p className="text-sm font-semibold text-foreground">{currentUser.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Telefone</p>
                    <p className="text-sm font-semibold text-foreground">{currentUser.whatsapp}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-8 pt-6 border-t border-border space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Matches</span>
                    <span className="text-lg font-bold text-gold">{matchCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Amizades</span>
                    <span className="text-lg font-bold text-secondary">{friendshipCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Seleções</span>
                    <span className="text-lg font-bold text-foreground">{allSelections.length}</span>
                  </div>
                </div>

                {/* Selections Detail Toggle */}
                {allSelections.length > 0 && (
                  <button
                    onClick={() => setShowSelectionsDetail(!showSelectionsDetail)}
                    className="w-full mt-6 pt-6 border-t border-border flex items-center justify-between text-foreground hover:text-gold transition-colors"
                  >
                    <span className="text-sm font-medium">Ver Detalhes</span>
                    {showSelectionsDetail ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>
                )}

                {/* Selections Detail */}
                {showSelectionsDetail && allSelections.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border space-y-4">
                    {getSelectionsByType('match').length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gold mb-2 uppercase">Matches ({getSelectionsByType('match').length})</p>
                        <div className="space-y-1">
                          {getSelectionsByType('match').map(sel => {
                            const user = allUsers.find(u => u.id === sel.userId);
                            return (
                              <p key={sel.userId} className="text-xs text-foreground flex items-center gap-2">
                                <Heart size={12} className="text-gold" /> {user?.name}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {getSelectionsByType('friendship').length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-secondary mb-2 uppercase">Amizades ({getSelectionsByType('friendship').length})</p>
                        <div className="space-y-1">
                          {getSelectionsByType('friendship').map(sel => {
                            const user = allUsers.find(u => u.id === sel.userId);
                            return (
                              <p key={sel.userId} className="text-xs text-foreground flex items-center gap-2">
                                <Users size={12} className="text-secondary" /> {user?.name}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {getSelectionsByType('no-interest').length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-destructive mb-2 uppercase">Sem Interesse ({getSelectionsByType('no-interest').length})</p>
                        <div className="space-y-1">
                          {getSelectionsByType('no-interest').map(sel => {
                            const user = allUsers.find(u => u.id === sel.userId);
                            return (
                              <p key={sel.userId} className="text-xs text-foreground flex items-center gap-2">
                                <XCircle size={12} className="text-destructive" /> {user?.name}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Users List */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-foreground">Participantes</h2>
                    <p className="text-muted-foreground mt-1">Veja quem mais está participando</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total de participantes</p>
                    <p className="text-2xl font-bold text-gold">{otherUsers.length}</p>
                  </div>
                </div>

                {/* Users Grid */}
                <div className="grid sm:grid-cols-2 gap-6">
                  {otherUsers.map(user => {
                    const selection = getSelectionForUser(user.id);
                    return (
                      <div
                        key={user.id}
                        className={`bg-card border-2 rounded-2xl overflow-hidden transition-all ${
                          selection
                            ? selection.type === 'match'
                              ? 'border-gold shadow-lg shadow-gold/20'
                              : selection.type === 'friendship'
                              ? 'border-secondary shadow-lg shadow-secondary/20'
                              : 'border-destructive/50 opacity-75'
                            : 'border-border hover:border-gold/50'
                        }`}
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

                          {selection && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="text-white text-center">
                                {selection.type === 'match' && (
                                  <Heart size={40} className="mb-2 mx-auto" fill="white" />
                                )}
                                {selection.type === 'friendship' && (
                                  <Users size={40} className="mb-2 mx-auto" />
                                )}
                                {selection.type === 'no-interest' && (
                                  <XCircle size={40} className="mb-2 mx-auto" />
                                )}
                                <p className="text-xs font-medium">
                                  {selection.type === 'match' && 'Match'}
                                  {selection.type === 'friendship' && 'Amizade'}
                                  {selection.type === 'no-interest' && 'Sem Interesse'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* User Info */}
                        <div className="p-4">
                          <div className="mb-4">
                            <h3 className="font-semibold text-foreground text-lg">{user.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              @{user.username}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="space-y-2">
                            <button
                              onClick={() => handleSelection(user.id, 'match')}
                              className={`w-full px-3 py-2 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2 ${
                                selection?.type === 'match'
                                  ? 'bg-gold text-secondary-foreground hover:bg-gold/90'
                                  : 'bg-muted hover:bg-muted/80 text-foreground'
                              }`}
                            >
                              <Heart size={16} />
                              Match
                            </button>
                            <button
                              onClick={() => handleSelection(user.id, 'friendship')}
                              className={`w-full px-3 py-2 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2 ${
                                selection?.type === 'friendship'
                                  ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                                  : 'bg-muted hover:bg-muted/80 text-foreground'
                              }`}
                            >
                              <Users size={16} />
                              Amizade
                            </button>
                            <button
                              onClick={() => handleSelection(user.id, 'no-interest')}
                              className={`w-full px-3 py-2 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2 ${
                                selection?.type === 'no-interest'
                                  ? 'bg-destructive text-white hover:bg-destructive/90'
                                  : 'bg-muted hover:bg-muted/80 text-foreground'
                              }`}
                            >
                              <X size={16} />
                              Sem Interesse
                            </button>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
