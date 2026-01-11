import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn, isAuthenticated, user } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user-profile');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate form
      if (!email || !password) {
        setError('Por favor, preencha todos os campos');
        setIsLoading(false);
        return;
      }

      if (!email.includes('@')) {
        setError('Por favor, insira um email válido');
        setIsLoading(false);
        return;
      }

      console.log('[LOGIN] Submitting form with email:', email);
      const result = await signIn(email, password);
      console.log('[LOGIN] signIn result:', result);

      if (result.success) {
        console.log('[LOGIN] Sign in successful');
        toast.success('Login realizado com sucesso!');
        // Navigation will happen via the useEffect above
      } else {
        console.error('[LOGIN] Sign in failed:', result.error);
        setError(result.error || 'Erro ao fazer login');
      }
    } catch (err) {
      console.error('[LOGIN] Error during submit:', err);
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with back button */}
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
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-foreground hover:text-gold transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Voltar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Login Container */}
      <div className="flex-1 flex items-center justify-center pt-40 pb-8 px-6">
        <div className="w-full max-w-md">
          {/* Decorative Elements */}
          <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-muted/10 rounded-full blur-3xl -z-10" />

          {/* Card */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-elegant">
            {/* Title */}
            <div className="mb-8">
              <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
                Bem-vindo de volta
              </h1>
              <p className="text-muted-foreground">
                Faça login para acessar sua conta
              </p>
            </div>


            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </div>

          {/* Footer Text */}
          <div className="text-center mt-8">
            <p className="text-xs text-muted-foreground">
              © 2025 Flashdate. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
