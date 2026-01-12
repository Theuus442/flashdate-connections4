import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User, Calendar, Settings, Upload, X, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useUsers } from '@/context/UsersContext';
import { toast } from 'sonner';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { signOut, user: authUser } = useAuth();
  const { getUserById, updateUser } = useUsers();

  // Load real user data from context
  const realUser = authUser ? getUserById(authUser.id) : null;
  const [clientUser, setClientUser] = useState(realUser);

  const [activeTab, setActiveTab] = useState<'profile' | 'events' | 'matches'>('profile');
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Update clientUser when realUser changes
  useEffect(() => {
    if (realUser) {
      setClientUser(realUser);
    }
  }, [realUser]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setClientUser(prev => ({
          ...prev,
          profileImage: imageUrl,
        }));
        setIsEditingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setClientUser(prev => ({
      ...prev,
      profileImage: undefined,
    }));
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
                Bem-vindo, <span className="text-foreground font-medium">{clientUser.name}</span>
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
                        {clientUser.profileImage ? (
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
                              {clientUser.name.charAt(0)}
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

                      {isEditingImage && !clientUser.profileImage && (
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

                      <h2 className="font-serif text-2xl font-bold text-foreground">{clientUser.name}</h2>
                      <p className="text-muted-foreground text-sm">@{clientUser.username}</p>
                    </div>

                    <div className="space-y-4 border-t border-border pt-6">
                      <InfoItem label="Profissão" value={clientUser.profession} />
                      <InfoItem label="Idade" value={`${clientUser.age} anos`} />
                      <InfoItem label="Email" value={clientUser.email} />
                      <InfoItem label="WhatsApp" value={clientUser.whatsapp} />
                    </div>
                  </div>

                  {/* Edit Profile Card */}
                  <div className="bg-card border border-border rounded-2xl p-8">
                    <h3 className="font-serif text-xl font-bold text-foreground mb-6">Editar Perfil</h3>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Nome Completo
                        </label>
                        <input
                          type="text"
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
                          defaultValue={clientUser.whatsapp}
                          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Profissão
                        </label>
                        <input
                          type="text"
                          defaultValue={clientUser.profession}
                          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                        />
                      </div>
                      <Button variant="gold" className="w-full mt-6">
                        Salvar Alterações
                      </Button>
                    </form>
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
              <div className="max-w-4xl">
                <div className="mb-8">
                  <h1 className="font-serif text-4xl font-bold text-foreground">Meus Matches</h1>
                  <p className="text-muted-foreground mt-2">Pessoas com quem você teve match</p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-8 text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <User size={32} className="text-muted-foreground" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                      Nenhum match ainda
                    </h3>
                    <p className="text-muted-foreground">
                      Participe do próximo evento para conhecer novas pessoas e encontrar seus matches!
                    </p>
                    <Button variant="gold" className="mt-6" asChild>
                      <a href="/#proximo-evento">Ver Próximo Evento</a>
                    </Button>
                  </div>
                </div>
              </div>
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
