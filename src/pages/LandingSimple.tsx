import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function LandingSimple() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2F7ae76be6e58c491eb25694248ac39762%2Fc0f4bc1f8fe742e5909a2996e1bfd491?format=webp&width=800"
          alt="FlashDate - Encontros Reais"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen container mx-auto px-6">
        {/* Logo */}
        <a href="/" className="mb-12 flex items-center gap-2">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F73d680b1b3a649a9a5bc7e1247d963e4%2F685f0706602c47e4964899c8526c67cd?format=webp&width=800"
            alt="Flashdate Logo"
            className="h-16 w-auto"
          />
        </a>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            variant="hero" 
            size="xl"
            onClick={() => navigate('/dashboard')}
          >
            Garantir Meu Lugar
          </Button>
          <Button 
            variant="wine" 
            size="lg"
            onClick={() => navigate('/')}
          >
            Saiba Mais
          </Button>
        </div>
      </div>
    </div>
  );
}
