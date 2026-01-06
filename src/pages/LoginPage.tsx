import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulated login logic - replace with actual API call
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

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Success - redirect to home
      navigate('/');
    } catch (err) {
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
                src="https://cdn.builder.io/api/v1/image/assets%2F73d680b1b3a649a9a5bc7e1247d963e4%2F685f0706602c47e4964899c8526c67cd?format=webp&width=800"
                alt="Flashdate Logo"
                className="h-10 w-auto"
              />
              <span className="hidden sm:inline font-bold text-lg text-foreground">
                Flash<span className="text-gold">⚡</span>Date
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
      <div className="flex-1 flex items-center justify-center pt-20 pb-8 px-6">
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

              {/* Forgot Password Link */}
              <div className="text-center">
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-gold transition-colors"
                >
                  Esqueceu sua senha?
                </a>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Ou</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Não tem uma conta?{' '}
                <a href="#proximo-evento" className="text-gold font-medium hover:underline">
                  Inscreva-se
                </a>
              </p>
            </div>
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
