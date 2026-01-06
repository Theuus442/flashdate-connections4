import { Button } from '@/components/ui/button';
import { ChevronDown, Sparkles } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';

export const HeroSection = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Flashdate - Encontros elegantes"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <div className="absolute inset-0 bg-hero-gradient opacity-70" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-wine/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-gold/10 rounded-full blur-3xl animate-float delay-300" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-background/30 backdrop-blur-sm mb-8 animate-fade-up">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-sm text-gold font-medium">Powered by AI</span>
          </div>

          {/* Main Title */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 animate-fade-up delay-100">
            <span className="text-foreground">Flashdate:</span>{' '}
            <span className="text-gradient-gold">Encontros Reais</span>
            <span className="text-foreground">, Inteligência Artificial,</span>{' '}
            <span className="text-gradient-wine">Conexões Verdadeiras.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto mb-10 leading-relaxed animate-fade-up delay-200">
            A plataforma pioneira de encontros presenciais que utiliza IA para identificar seu match 
            com maior potencial. Acreditamos que há alguém procurando exatamente por você.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
            <Button variant="hero" size="xl" asChild>
              <a href="#proximo-evento">Garantir Meu Lugar</a>
            </Button>
            <Button variant="elegant" size="lg" asChild>
              <a href="#como-funciona">Saiba Mais</a>
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <a href="#como-funciona" className="flex flex-col items-center gap-2 text-gold/60 hover:text-gold transition-colors">
            <span className="text-xs uppercase tracking-widest">Descubra</span>
            <ChevronDown className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};
