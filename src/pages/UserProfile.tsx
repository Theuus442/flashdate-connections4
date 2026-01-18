import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Users, X, LogOut, Camera, ChevronDown, ChevronUp, UserCircle2, XCircle, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useUsers, type User } from '@/context/UsersContext';
import { useSelections } from '@/context/SelectionsContext';
import { useAuth } from '@/context/AuthContext';
import { eventsService } from '@/lib/events.service';
import { finalizationService } from '@/lib/finalization.service';
import FinalizationConfirmDialog from '@/components/FinalizationConfirmDialog';
import FinalizedProfileBadge, { FinalizedStatusCard } from '@/components/FinalizedProfileBadge';

export default function UserProfile() {
  const navigate = useNavigate();
  const { signOut, user: authUser } = useAuth();
  const { users: allUsers, updateUser } = useUsers();
  const { updateSelection, setCurrentUserId, setCurrentEventId, getSelectionsByVote } = useSelections();
  const [currentEventId, setEventId] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Desconectado com sucesso');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Erro ao desconectar');
    }
  };

  // Get the logged-in user from authenticated context
  const currentUser = useMemo(() => {
    if (!authUser) return null;
    return allUsers.find(u => u.id === authUser.id) || null;
  }, [authUser, allUsers]);

  // Load first available event from database
  useEffect(() => {
    const loadEvent = async () => {
      try {
        const { data, error } = await eventsService.getEvents();
        if (error) {
          console.error('Error loading events:', error);
          return;
        }
        if (data && data.length > 0) {
          setEventId(data[0].id);
        }
      } catch (error) {
        console.error('Unexpected error loading events:', error);
      }
    };

    loadEvent();
  }, []);

  // Set current user and event in selections context
  useEffect(() => {
    if (currentUser) {
      setCurrentUserId(currentUser.id);
    }
    if (currentEventId) {
      setCurrentEventId(currentEventId);
    }
  }, [currentUser, currentEventId, setCurrentUserId, setCurrentEventId]);

  // Check if user is finalized for the current event
  useEffect(() => {
    const checkFinalizationStatus = async () => {
      if (!authUser || !currentEventId) {
        setIsUserFinalized(false);
        return;
      }

      const finalized = await finalizationService.isUserFinalized(currentEventId, authUser.id);
      setIsUserFinalized(finalized);
    };

    checkFinalizationStatus();
  }, [authUser, currentEventId]);

  const [imagePreview, setImagePreview] = useState<string | undefined>(currentUser?.profileImage);
  const [selectedImageFile, setSelectedImageFile] = useState<File | undefined>(undefined);
  const [showSelectionsDetail, setShowSelectionsDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'participants' | 'matches' | 'profile'>('participants');
  const [genderFilter, setGenderFilter] = useState<'all' | 'M' | 'F'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUserFinalized, setIsUserFinalized] = useState(false);
  const [showFinalizationDialog, setShowFinalizationDialog] = useState(false);
  const [isFinalizingSelections, setIsFinalizingSelections] = useState(false);

  // Filter and sort users excluding the current user and admins
  const otherUsers = useMemo(() => {
    let filtered = currentUser ? allUsers.filter(user => user.id !== currentUser.id && user.role !== 'admin') : allUsers;

    // Apply gender filter
    if (genderFilter !== 'all') {
      filtered = filtered.filter(user => user.gender === genderFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const comparison = a.name.localeCompare(b.name, 'pt-BR');
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [currentUser, allUsers, genderFilter, sortOrder]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setImagePreview(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImage = async () => {
    if (selectedImageFile && currentUser && imagePreview) {
      setIsUploadingImage(true);
      try {
        const result = await updateUser(currentUser.id, { profileImage: imagePreview }, selectedImageFile);
        if (result) {
          toast.success('Foto atualizada com sucesso!');
          setSelectedImageFile(undefined);
        } else {
          toast.error('Falha ao atualizar foto');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Erro ao fazer upload da foto');
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleRemoveImage = async () => {
    if (currentUser) {
      setImagePreview(undefined);
      setSelectedImageFile(undefined);
      const result = await updateUser(currentUser.id, { profileImage: undefined });
      if (result) {
        toast.success('Foto removida');
      } else {
        toast.error('Falha ao remover foto');
      }
    }
  };

  const handleSelection = async (selectedUserId: string, vote: 'SIM' | 'TALVEZ' | 'NÃO') => {
    if (!currentUser || !currentEventId) return;

    // Check if user is finalized
    if (isUserFinalized) {
      toast.info('Seu perfil está consolidado e não pode ser alterado');
      return;
    }

    try {
      await updateSelection(currentEventId, currentUser.id, selectedUserId, vote);
    } catch (error) {
      console.error('Error updating selection:', error);
      toast.error('Erro ao processar seleção');
    }
  };

  const handleFinalize = () => {
    // Check if user has made at least one selection
    if (allSelections.length === 0) {
      toast.error('Faça pelo menos uma seleção antes de finalizar');
      return;
    }

    // Show finalization confirmation dialog
    setShowFinalizationDialog(true);
  };

  const handleConfirmFinalization = async () => {
    if (!currentUser || !currentEventId) {
      toast.error('Erro: Evento não carregado');
      return;
    }

    try {
      setIsFinalizingSelections(true);

      // Call finalization service
      const result = await finalizationService.finalizeUserSelections(currentEventId, currentUser.id);

      if (!result.success) {
        toast.error(result.message);
        setIsFinalizingSelections(false);
        return;
      }

      // Update local state
      setIsUserFinalized(true);

      const matchesCount = getSelectionsByVote('SIM').length;
      const talvezCount = getSelectionsByVote('TALVEZ').length;

      toast.success(`✓ Seleções finalizadas! ${matchesCount} match(es) e ${talvezCount} amizade(s)`);

      // Close dialog
      setShowFinalizationDialog(false);
      setIsFinalizingSelections(false);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('Error finalizing selections:', errorMsg);
      toast.error('Erro ao finalizar seleções');
      setIsFinalizingSelections(false);
    }
  };

  const matchCount = getSelectionsByVote('SIM').length;
  const talvezCount = getSelectionsByVote('TALVEZ').length;
  const naoCount = getSelectionsByVote('NÃO').length;
  const allSelections = getSelectionsByVote('SIM').concat(
    getSelectionsByVote('TALVEZ'),
    getSelectionsByVote('NÃO')
  );

  const getSelectionForUser = (userId: string) => {
    return allSelections.find(s => s.selectedUserId === userId);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
              Nenhum usuário cadastrado
            </h2>
            <p className="text-muted-foreground mb-6">
              No momento, não existem usuários no sistema. Peça ao administrador para cadastrar participantes antes de prosseguir.
            </p>
          </div>
          <Button onClick={() => navigate('/')} variant="gold" className="w-full">
            Voltar à Página Inicial
          </Button>
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
                src="https://cdn.builder.io/api/v1/image/assets%2F8f3ace03e7c74437bf1e2c3a827303bb%2F72efb2f93aeb4f98a010f02c385b13d6?format=webp&width=800"
                alt="Flashdate Logo"
                className="h-16 w-auto"
              />
              <span className="hidden sm:inline font-bold text-lg text-foreground">
                FlashDate<span className="text-gold">⚡</span>
              </span>
            </a>
            <div className="flex items-center gap-4">
              {isUserFinalized && (
                <FinalizedProfileBadge size="sm" />
              )}
              <span className="hidden sm:inline text-sm text-muted-foreground">
                Bem-vindo, <span className="text-foreground font-medium">{currentUser.name}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Finalization Dialog */}
      <FinalizationConfirmDialog
        open={showFinalizationDialog}
        onOpenChange={setShowFinalizationDialog}
        onConfirm={handleConfirmFinalization}
        isLoading={isFinalizingSelections}
        matchCount={getSelectionsByVote('SIM').length}
        friendshipCount={getSelectionsByVote('TALVEZ').length}
      />

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
                SIM ({matchCount})
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
              {!currentEventId && (
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-900 dark:text-amber-100">
                    ⚠️ Nenhum evento disponível no momento. Participe de um evento para visualizar e selecionar participantes.
                  </p>
                </div>
              )}
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
                        {isUserFinalized ? (
                          <div className="flex-1 flex items-center justify-around sm:justify-start px-2 sm:px-4 py-2 sm:py-4 gap-1 sm:gap-4">
                            {selection ? (
                              <div className="flex-1 text-center">
                                <p className="text-xs font-medium text-gold mb-1">Voto Registrado</p>
                                <p className="text-xs text-muted-foreground">
                                  {selection.vote === 'SIM' ? '💕 Match' : selection.vote === 'TALVEZ' ? '👥 Amizade' : '❌ Sem Interesse'}
                                </p>
                              </div>
                            ) : (
                              <div className="flex-1 text-center">
                                <p className="text-xs text-muted-foreground">Sem voto</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center justify-around sm:justify-start px-2 sm:px-4 py-2 sm:py-4 gap-1 sm:gap-4">
                            <button
                              onClick={() => handleSelection(user.id, 'SIM')}
                              disabled={!currentEventId}
                              className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-full transition-all flex-shrink-0 ${
                                !currentEventId ? 'opacity-50 cursor-not-allowed' : ''
                              } ${
                                selection?.vote === 'SIM'
                                  ? 'ring-3 ring-gold ring-offset-2 ring-offset-background'
                                  : 'hover:ring-2 hover:ring-gold/50 hover:ring-offset-2 hover:ring-offset-background'
                              }`}
                              title={currentEventId ? "SIM" : "Nenhum evento disponível"}
                            >
                              <Heart size={18} className={`sm:w-6 sm:h-6 ${selection?.vote === 'SIM' ? 'text-gold fill-gold' : 'text-foreground'}`} />
                              <span className="text-xs font-medium mt-0.5 sm:mt-1">SIM</span>
                            </button>
                            <button
                              onClick={() => handleSelection(user.id, 'TALVEZ')}
                              disabled={!currentEventId}
                              className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-full transition-all flex-shrink-0 ${
                                !currentEventId ? 'opacity-50 cursor-not-allowed' : ''
                              } ${
                                selection?.vote === 'TALVEZ'
                                  ? 'ring-3 ring-secondary ring-offset-2 ring-offset-background'
                                  : 'hover:ring-2 hover:ring-secondary/50 hover:ring-offset-2 hover:ring-offset-background'
                              }`}
                              title={currentEventId ? "TALVEZ" : "Nenhum evento disponível"}
                            >
                              <Users size={18} className={`sm:w-6 sm:h-6 ${selection?.vote === 'TALVEZ' ? 'text-secondary fill-secondary' : 'text-foreground'}`} />
                              <span className="text-xs font-medium mt-0.5 sm:mt-1">TALVEZ</span>
                            </button>
                            <button
                              onClick={() => handleSelection(user.id, 'NÃO')}
                              disabled={!currentEventId}
                              className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-full transition-all flex-shrink-0 ${
                                !currentEventId ? 'opacity-50 cursor-not-allowed' : ''
                              } ${
                                selection?.vote === 'NÃO'
                                  ? 'ring-3 ring-destructive ring-offset-2 ring-offset-background'
                                  : 'hover:ring-2 hover:ring-destructive/50 hover:ring-offset-2 hover:ring-offset-background'
                              }`}
                              title={currentEventId ? "NÃO" : "Nenhum evento disponível"}
                            >
                              <X size={18} className={`sm:w-6 sm:h-6 ${selection?.vote === 'NÃO' ? 'text-destructive' : 'text-foreground'}`} />
                              <span className="text-xs font-medium mt-0.5 sm:mt-1">NÃO</span>
                            </button>
                          </div>
                        )}
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
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Gênero:</span>
                          <span>{user.gender === 'M' ? 'Masculino' : user.gender === 'F' ? 'Feminino' : 'Outro'}</span>
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
            <div className="max-w-2xl mx-auto w-full space-y-8">
              {isUserFinalized && (
                <FinalizedStatusCard />
              )}
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

                  <label className={`flex items-center justify-center w-full max-w-sm mx-auto px-4 py-3 border-2 border-dashed border-border rounded-lg transition-colors ${
                    isUserFinalized
                      ? 'opacity-50 cursor-not-allowed bg-muted/20'
                      : 'cursor-pointer hover:border-gold bg-muted/30'
                  }`}>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Camera className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {isUserFinalized ? 'Fotos travadas' : 'Adicionar foto'}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isUserFinalized}
                      className="hidden"
                    />
                  </label>

                  {selectedImageFile && imagePreview && (
                    <div className="flex gap-3 justify-center max-w-sm mx-auto mt-4">
                      <Button
                        onClick={handleSaveImage}
                        disabled={isUploadingImage}
                        variant="gold"
                        className="flex-1"
                      >
                        {isUploadingImage ? 'Salvando...' : 'Salvar Foto'}
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedImageFile(undefined);
                          setImagePreview(currentUser?.profileImage);
                        }}
                        disabled={isUploadingImage}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
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
                  <div className="mt-8 pt-8 border-t border-border grid grid-cols-3 gap-4 mb-8">
                    <div className="text-center">
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase">SIM</p>
                      <p className="text-3xl font-bold text-gold">{matchCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase">TALVEZ</p>
                      <p className="text-3xl font-bold text-secondary">{talvezCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase">Total</p>
                      <p className="text-3xl font-bold text-foreground">{allSelections.length}</p>
                    </div>
                  </div>

                  {/* Finalize Button */}
                  {!isUserFinalized && allSelections.length > 0 && (
                    <div className="pt-8 border-t border-border">
                      <Button
                        onClick={handleFinalize}
                        variant="hero"
                        className="w-full py-3"
                      >
                        Finalizar Seleções
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Matches View */}
          {activeTab === 'matches' && (
            <div className="flex-1 flex flex-col">
              {getSelectionsByVote('SIM').length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {getSelectionsByVote('SIM').map(sel => {
                    const user = allUsers.find(u => u.id === sel.selectedUserId);
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
                              <p className="text-xs font-medium">SIM</p>
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
                            <p className="text-xs text-muted-foreground mt-1">
                              {user.gender === 'M' ? 'Masculino' : user.gender === 'F' ? 'Feminino' : 'Outro'}
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
                    <p className="text-muted-foreground text-lg">Nenhum SIM ainda</p>
                    <p className="text-muted-foreground text-sm mt-2">Comece a fazer conexões selecionando "SIM" em outros participantes</p>
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
