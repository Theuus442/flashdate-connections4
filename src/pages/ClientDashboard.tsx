import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User, Calendar, Settings, Upload, X, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useUsers } from '@/context/UsersContext';
import { useSelections } from '@/context/SelectionsContext';
import { usersService } from '@/lib/users.service';
import { eventsService } from '@/lib/events.service';
import { finalizationService } from '@/lib/finalization.service';
import { toast } from 'sonner';

/**
 * Helper function to safely serialize any error to a readable string
 */
function serializeError(error: any): string {
  if (error === null) return 'No error';
  if (error === undefined) return 'Undefined error';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object') {
    const message = (error.message || error.msg || error.error || error.detail || '').toString();
    const code = (error.code || '').toString();
    const details = (error.details || '').toString();
    const parts = [message, code && `[${code}]`, details].filter(Boolean);
    return parts.length > 0 ? parts.join(' - ') : JSON.stringify(error);
  }
  return String(error);
}

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { signOut, user: authUser } = useAuth();
  const { users, updateUser, isLoading, refreshUsers } = useUsers();
  const { setCurrentUserId, setCurrentEventId: setSelectionsEventId } = useSelections();

  // Load real user data from users array
  const realUser = authUser ? users.find(u => u.id === authUser.id) : null;
  const [clientUser, setClientUser] = useState<any>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | undefined>(undefined);

  const [activeTab, setActiveTab] = useState<'profile' | 'events' | 'matches'>('profile');
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(3);
  const [isUserFinalized, setIsUserFinalized] = useState(false);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

  // Refresh users list on mount and when auth user changes
  useEffect(() => {
    if (authUser) {
      console.log('[ClientDashboard] Auth user detected, refreshing users list...');
      refreshUsers();
    }
  }, [authUser, refreshUsers]);

  // Fetch user data directly if not found in users array
  useEffect(() => {
    const loadUserData = async () => {
      if (!authUser || clientUser) {
        return; // Already have data or no auth user
      }

      // Check if user is in the users array
      const userInArray = users.find(u => u.id === authUser.id);
      if (userInArray) {
        console.log('[ClientDashboard] User found in array:', userInArray);
        setClientUser(userInArray);
        return;
      }

      // User not found in array - fetch directly from database
      console.log('[ClientDashboard] User not found in array, fetching directly from database...');
      setIsLoadingUserData(true);
      try {
        // Try fetching by ID first
        console.log('[ClientDashboard] Attempting to fetch user by ID:', authUser.id);
        let result = await usersService.getUserById(authUser.id);

        // If not found by ID (no data and no error, or error occurred), try by email
        if (!result.data && authUser.email) {
          console.log('[ClientDashboard] User not found by ID, trying by email:', authUser.email);
          result = await usersService.getUserByEmail(authUser.email);
        }

        // Now check if we have data
        if (result.data) {
          console.log('[ClientDashboard] User data loaded successfully:', result.data);
          setClientUser(result.data);
        } else {
          // User not found by ID or email - try to sync from auth
          console.warn('[ClientDashboard] ⚠️ User not found in database:', {
            userId: authUser.id,
            userEmail: authUser.email,
            result: result.error ? 'Error during fetch' : 'No data found',
          });

          // Try to sync user from auth to database
          console.log('[ClientDashboard] 🔄 Attempting to sync user from auth to database...');
          try {
            const syncResult = await usersService.syncAuthUserToDatabase({
              id: authUser.id,
              email: authUser.email || '',
              user_metadata: authUser.user_metadata,
            });

            if (syncResult.data) {
              console.log('[ClientDashboard] ✅ User synced successfully from auth:', syncResult.data);
              setClientUser(syncResult.data);
            } else {
              const syncErrorStr = serializeError(syncResult.error);
              console.error('[ClientDashboard] ❌ Failed to sync user from auth:', {
                userId: authUser.id,
                userEmail: authUser.email,
                error: syncErrorStr,
              });
              setClientUser(null);
            }
          } catch (syncError) {
            const syncErrorMsg = serializeError(syncError);
            console.error('[ClientDashboard] ❌ Unexpected error during sync:', {
              userId: authUser.id,
              error: syncErrorMsg,
            });
            setClientUser(null);
          }
        }
      } catch (error) {
        const errorMessage = serializeError(error);
        console.error('[ClientDashboard] ❌ Unexpected error loading user:', {
          userId: authUser.id,
          error: errorMessage,
        });
        setClientUser(null);
      } finally {
        setIsLoadingUserData(false);
      }
    };

    loadUserData();
  }, [authUser, users, clientUser, retryCount]);

  // Update clientUser when realUser changes
  useEffect(() => {
    if (realUser && !clientUser) {
      console.log('[ClientDashboard] Loading user data from array:', realUser);
      setClientUser(realUser);
    }
  }, [realUser]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && clientUser) {
      // Store the file for upload when saving
      setSelectedImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setClientUser(prev => prev ? {
          ...prev,
          profileImage: imageUrl,
        } : prev);
        setIsEditingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    if (clientUser) {
      setSelectedImageFile(undefined);
      setClientUser(prev => prev ? {
        ...prev,
        profileImage: undefined,
      } : prev);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!clientUser || !authUser) {
      toast.error('Erro: dados do usuário não encontrados');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const formData = new FormData(e.currentTarget);
      const updatedData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        whatsapp: formData.get('whatsapp') as string,
      };

      console.log('[ClientDashboard] Saving profile with image:', {
        hasImage: !!selectedImageFile,
        fileName: selectedImageFile?.name,
        userId: clientUser.id,
        authId: authUser.id,
      });

      // Use clientUser.id (from database) not authUser.id (from auth)
      // They may be different due to auth/db sync issues
      const result = await updateUser(clientUser.id, updatedData, selectedImageFile);

      if (result.data) {
        toast.success('Perfil atualizado com sucesso!');
        // Add cache buster to profile image URL to force browser to reload image
        const updatedUserData = {
          ...result.data,
          profileImage: result.data.profileImage
            ? `${result.data.profileImage}?t=${Date.now()}`
            : result.data.profileImage
        };
        setClientUser(updatedUserData);
        setSelectedImageFile(undefined); // Clear the selected file after successful upload
      } else {
        const errorMsg = result.error || 'Erro desconhecido';
        console.error('Error updating profile:', errorMsg);

        // Check if it's a user not found error
        if (errorMsg && (errorMsg.includes('does not exist') || errorMsg.includes('não foi encontrado'))) {
          console.warn('[ClientDashboard] User not found in database. Auth ID:', authUser?.id, 'Email:', authUser?.email);
          toast.error('Erro: Sua conta não foi encontrada no servidor. Faça login novamente.');
          setTimeout(() => {
            signOut();
            navigate('/login');
          }, 2000);
        } else if (errorMsg && errorMsg.includes('sincronizada')) {
          toast.error(errorMsg);
          console.warn('[ClientDashboard] Data synchronization issue detected');
        } else {
          toast.error(`Erro ao atualizar perfil: ${errorMsg}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error updating profile:', errorMessage);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Desconectado com sucesso');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Erro ao desconectar');
      navigate('/login');
    }
  };

  // Debug logs
  useEffect(() => {
    console.log('[ClientDashboard] State update:', {
      isLoading,
      isLoadingUserData,
      hasAuthUser: !!authUser,
      usersCount: users.length,
      hasClientUser: !!clientUser,
      userId: authUser?.id,
      clientUserData: clientUser ? { id: clientUser.id, name: clientUser.name, email: clientUser.email } : null,
    });
  }, [isLoading, isLoadingUserData, authUser, users, clientUser]);

  // Show loading state while data is being fetched
  if ((isLoading || isLoadingUserData) && !clientUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando seu perfil...</p>
        </div>
      </div>
    );
  }

  // Show error state if user could not be loaded
  if (!clientUser && !isLoading && !isLoadingUserData && authUser) {
    const handleRetry = () => {
      setRetryCount(prev => prev + 1);
      setClientUser(null);
    };

    const handleLogout = async () => {
      try {
        await signOut();
        navigate('/login');
      } catch (error) {
        console.error('Error logging out:', error);
        navigate('/login');
      }
    };

    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <X size={32} className="text-destructive" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
              Perfil não carregado
            </h2>
            <p className="text-muted-foreground mb-2">
              Ocorreu um problema ao carregar seus dados do servidor.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              ID de autenticação: <code className="text-xs bg-muted px-2 py-1 rounded">{authUser.id}</code>
            </p>
          </div>

          <div className="space-y-3">
            {retryCount < maxRetries ? (
              <>
                <Button onClick={handleRetry} variant="gold" className="w-full">
                  Tentar Novamente ({retryCount}/{maxRetries})
                </Button>
                <p className="text-xs text-muted-foreground">
                  Se o problema persistir, tente fazer logout e login novamente.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-destructive font-medium mb-4">
                  Não conseguimos carregar seu perfil após várias tentativas.
                </p>
                <Button onClick={handleLogout} variant="outline" className="w-full mb-3">
                  Fazer Logout
                </Button>
                <p className="text-xs text-muted-foreground">
                  Faça login novamente para sincronizar seus dados.
                </p>
              </>
            )}
          </div>
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
              <Button
                variant="hero"
                size="sm"
                onClick={() => navigate('/event-selection')}
                className="hidden sm:flex items-center gap-2"
              >
                <Heart size={16} />
                Selecionar Matches
              </Button>
              <span className="hidden sm:inline text-sm text-muted-foreground">
                Bem-vindo, <span className="text-foreground font-medium">{clientUser?.name || 'Usuário'}</span>
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

      {/* Connectivity Warning */}
      {users.length === 0 && !isLoading && (
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-3 text-sm">
          <div className="container mx-auto flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-medium">Problema de conectividade</p>
              <p className="text-xs mt-1">Não conseguimos conectar ao servidor. Verifique sua conexão e tente recarregar a página.</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="ml-auto text-xs font-medium underline hover:no-underline"
            >
              Recarregar
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 pt-20 flex flex-col lg:flex-row">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-border bg-card/30 p-6">
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-gold/10 text-gold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <User size={20} />
              <span>Meu Perfil</span>
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'events'
                  ? 'bg-gold/10 text-gold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Calendar size={20} />
              <span>Meus Eventos</span>
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'matches'
                  ? 'bg-gold/10 text-gold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Settings size={20} />
              <span>Meus Matches</span>
            </button>

            {/* CTA Button for Mobile */}
            <button
              onClick={() => navigate('/event-selection')}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium bg-gradient-to-r from-gold to-gold-dark text-secondary-foreground hover:from-gold-light hover:to-gold transition-colors shadow-gold-glow"
            >
              <Heart size={20} />
              <span>Selecionar Matches</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pb-8">
          <div className="container mx-auto px-6 py-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="max-w-3xl">
                <div className="mb-8">
                  <h1 className="font-serif text-4xl font-bold text-foreground">Meu Perfil</h1>
                  <p className="text-muted-foreground mt-2">Suas informações cadastradas</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Profile Card */}
                  <div className="bg-card border border-border rounded-2xl p-8">
                    <div className="flex flex-col items-center text-center mb-6">
                      {/* Profile Image Section */}
                      <div className="relative mb-4">
                        {clientUser && clientUser.profileImage ? (
                          <>
                            <img
                              src={clientUser.profileImage}
                              alt={clientUser.name}
                              className="w-32 h-32 rounded-full object-cover border-4 border-gold shadow-lg"
                            />
                            {isEditingImage && (
                              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center gap-2">
                                <button
                                  onClick={() => document.getElementById('profileImageInput')?.click()}
                                  className="p-2 bg-gold rounded-full text-secondary-foreground hover:bg-gold-dark transition-colors"
                                >
                                  <Upload size={20} />
                                </button>
                                <button
                                  onClick={handleRemoveImage}
                                  className="p-2 bg-destructive rounded-full text-white hover:bg-destructive/90 transition-colors"
                                >
                                  <X size={20} />
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center mb-0">
                            <span className="text-5xl font-bold text-secondary-foreground">
                              {clientUser?.name?.[0] || 'U'}
                            </span>
                          </div>
                        )}
                        {!isEditingImage && (
                          <button
                            onClick={() => setIsEditingImage(true)}
                            className="absolute bottom-0 right-0 p-2 bg-gold rounded-full text-secondary-foreground hover:bg-gold-dark transition-colors shadow-lg"
                          >
                            <Upload size={18} />
                          </button>
                        )}
                      </div>

                      {/* Hidden File Input */}
                      <input
                        id="profileImageInput"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />

                      {isEditingImage && !clientUser?.profileImage && (
                        <button
                          onClick={() => document.getElementById('profileImageInput')?.click()}
                          className="mb-4 px-4 py-2 bg-gold text-secondary-foreground rounded-lg font-medium hover:bg-gold-dark transition-colors text-sm"
                        >
                          Escolher Foto
                        </button>
                      )}

                      <button
                        onClick={() => setIsEditingImage(!isEditingImage)}
                        className="text-sm text-gold hover:text-gold-light transition-colors mb-2"
                      >
                        {isEditingImage ? 'Cancelar' : 'Editar Foto'}
                      </button>

                      <h2 className="font-serif text-2xl font-bold text-foreground">{clientUser?.name || 'Usuário'}</h2>
                      <p className="text-muted-foreground text-sm">@{clientUser?.username || 'username'}</p>
                    </div>

                    <div className="space-y-4 border-t border-border pt-6">
                      <InfoItem label="Email" value={clientUser?.email || '-'} />
                      <InfoItem label="WhatsApp" value={clientUser?.whatsapp || '-'} />
                      <InfoItem label="Gênero" value={clientUser?.gender || '-'} />
                    </div>
                  </div>

                  {/* Edit Profile Card */}
                  <div className="bg-card border border-border rounded-2xl p-8">
                    <h3 className="font-serif text-xl font-bold text-foreground mb-6">Editar Perfil</h3>
                    {clientUser ? (
                      <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Nome Completo
                          </label>
                          <input
                            type="text"
                            name="name"
                            defaultValue={clientUser.name}
                            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            defaultValue={clientUser.email}
                            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            WhatsApp
                          </label>
                          <input
                            type="tel"
                            name="whatsapp"
                            defaultValue={clientUser.whatsapp || ''}
                            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                          />
                        </div>
                        <Button
                          type="submit"
                          variant="gold"
                          className="w-full mt-6"
                          disabled={isUpdatingProfile}
                        >
                          {isUpdatingProfile ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                      </form>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Carregando dados do perfil...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="max-w-4xl">
                <div className="mb-8">
                  <h1 className="font-serif text-4xl font-bold text-foreground">Meus Eventos</h1>
                  <p className="text-muted-foreground mt-2">Eventos em que você está inscrito</p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-8">
                  <div className="space-y-6">
                    <div className="border-l-4 border-gold pl-6 py-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-serif text-xl font-bold text-foreground">
                            Armazém São Caetano
                          </h3>
                          <p className="text-muted-foreground mt-1">São Caetano do Sul, SP</p>
                        </div>
                        <span className="bg-gold/10 text-gold px-4 py-2 rounded-lg text-sm font-medium">
                          25/01/2026
                        </span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
                        <div>
                          <p className="text-sm text-muted-foreground">Horário</p>
                          <p className="font-medium text-foreground">Conforme agendado</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Check-in</p>
                          <p className="font-medium text-foreground">15-30 min antes</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <p className="font-medium text-gold">Inscrito</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Matches Tab */}
            {activeTab === 'matches' && (
              <MatchesTab userId={clientUser?.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2">
      <span className="text-sm font-medium text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

interface MatchUser {
  id: string;
  name: string;
  profileImage?: string;
  email?: string;
  whatsapp?: string;
  matchType: 'MATCH' | 'AMIZADE';
}

function MatchesTab({ userId }: { userId?: string }) {
  const [matches, setMatches] = useState<MatchUser[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const { users } = useUsers();

  useEffect(() => {
    const loadMatches = async () => {
      if (!userId) return;

      setIsLoadingMatches(true);
      try {
        const { selectionsService } = await import('@/lib/selections.service');
        const { data: mutualData } = await selectionsService.getMutualMatches();

        if (mutualData) {
          // Filter matches for current user and get user details
          const userMatches = mutualData
            .filter(m => m.userId === userId || m.selectedUserId === userId)
            .map(m => {
              const matchedUserId = m.userId === userId ? m.selectedUserId : m.userId;
              const matchedUser = users.find(u => u.id === matchedUserId);
              return {
                id: matchedUserId,
                name: matchedUser?.name || 'Usuário desconhecido',
                profileImage: matchedUser?.profileImage,
                email: matchedUser?.email,
                whatsapp: matchedUser?.whatsapp,
                matchType: m.matchType,
              };
            });

          setMatches(userMatches);
        }
      } catch (error) {
        console.error('Error loading matches:', error);
        setMatches([]);
      } finally {
        setIsLoadingMatches(false);
      }
    };

    loadMatches();
  }, [userId, users]);

  if (isLoadingMatches) {
    return (
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-foreground">Meus Matches</h1>
          <p className="text-muted-foreground mt-2">Pessoas com quem você teve match</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando seus matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-foreground">Meus Matches</h1>
        <p className="text-muted-foreground mt-2">Pessoas com quem você teve match ou amizade mútua</p>
      </div>

      {matches.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {matches.map(match => (
            <div key={match.id} className="bg-card border border-gold/20 rounded-2xl p-6 hover:border-gold/50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                {match.profileImage ? (
                  <img
                    src={match.profileImage}
                    alt={match.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gold"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-white font-bold text-xl">
                    {match.name[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    {match.name}
                  </h3>
                  <p className={`font-semibold text-sm ${match.matchType === 'MATCH' ? 'text-gold' : 'text-emerald'}`}>
                    {match.matchType === 'MATCH' ? '💕 Você deu match' : '💫 Vocês são amigos'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-t border-border/50 pt-4">
                {match.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Email:</span>
                    <a href={`mailto:${match.email}`} className="text-gold hover:text-gold-light truncate">
                      {match.email}
                    </a>
                  </div>
                )}
                {match.whatsapp && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">WhatsApp:</span>
                    <a
                      href={`https://wa.me/${match.whatsapp.replace(/[^\d]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:text-gold-light"
                    >
                      {match.whatsapp}
                    </a>
                  </div>
                )}
              </div>

              <Button variant="gold" className="w-full mt-4">
                <Heart size={16} className="mr-2" />
                Enviar Mensagem
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-8 text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Heart size={32} className="text-muted-foreground" />
            </div>
            <h3 className="font-serif text-xl font-bold text-foreground mb-2">
              Nenhum match ainda
            </h3>
            <p className="text-muted-foreground mb-6">
              Continue selecionando pessoas no próximo evento para encontrar seus matches!
            </p>
            <Button variant="gold" asChild>
              <a href="/event-selection">Ir para Seleções</a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
