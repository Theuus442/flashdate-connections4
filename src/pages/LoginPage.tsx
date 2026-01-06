import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Credentials {
  email: string;
  username?: string;
  password: string;
  role: 'admin' | 'client';
  label: string;
}

const TEST_CREDENTIALS: Credentials[] = [
  {
    email: 'admin@flashdate.com',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    label: 'Admin - Painel de Administração',
  },
  {
    email: 'cliente@flashdate.com',
    username: 'cliente',
    password: 'cliente123',
    role: 'client',
    label: 'Cliente - Perfil e Seleções',
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCopyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAutoFill = (credentials: Credentials) => {
    setEmail(credentials.username || credentials.email);
    setPassword(credentials.password);
  };

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

      // Check credentials
      const credential = TEST_CREDENTIALS.find(
        c => c.email === email && c.password === password
      );

      if (!credential) {
        setError('Email ou senha inválidos');
        setIsLoading(false);
        return;
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Success - redirect based on role
      toast.success(`Bem-vindo de volta, ${credential.role === 'admin' ? 'Administrador' : 'Cliente'}!`);

      if (credential.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user-profile');
      }
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

            {/* Test Credentials Info */}
            <div className="mb-8 p-4 rounded-xl bg-secondary/10 border border-secondary/20">
              <p className="text-xs font-semibold text-secondary mb-3 uppercase tracking-wide">
                📋 Credenciais de Teste
              </p>
              <div className="space-y-3">
                {TEST_CREDENTIALS.map((cred, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{cred.label}</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleAutoFill(cred)}
                        className="text-xs"
                      >
                        Auto-preenchimento
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-background rounded-lg border border-border">
                      <code className="flex-1 text-xs font-mono text-muted-foreground">
                        {cred.email} / {cred.password}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopyToClipboard(`${cred.email} / ${cred.password}`, `cred-${index}`)}
                        className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                      >
                        {copiedField === `cred-${index}` ? (
                          <Check size={16} className="text-gold" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
