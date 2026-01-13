import { Button } from '@/components/ui/button';

export const HeroSection = () => {
  return (
    <section
      id="home"
      className="relative flex flex-col min-h-[calc(100vh-80px)]"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 top-0 overflow-hidden">
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2F4a212f387eb54876979913c5cf0408d5%2F6074e42db9fa4e5f936854eaea1be09c?format=webp&width=1920"
          alt="Flashdate - Encontros elegantes"
          className="w-full h-full object-cover"
          style={{
            objectPosition: 'center top',
            filter: 'brightness(1.25) contrast(1.2) saturate(1.1)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center top, rgba(0,0,0,0) 0%, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.15) 100%)'
          }}
        />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-muted/10 rounded-full blur-3xl animate-float delay-300" />

      {/* Content */}
      <div className="relative z-10 pt-6 md:pt-10 lg:pt-12">
        <div className="container mx-auto px-4 sm:px-6 text-center w-full">
          <div className="max-w-xl mx-auto">
            {/* Main Title */}
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-snug mb-3 md:mb-4 animate-fade-up delay-100" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)' }}>
              <span className="text-white block mb-2 md:mb-3">FlashDate</span>
              <div className="space-y-0 text-white text-lg sm:text-xl md:text-2xl lg:text-3xl">
                <div>
                  <span style={{ color: '#ff3366' }}>Inteligência Artificial</span> para conexões verdadeiras
                </div>
              </div>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm md:text-base text-gray-200 max-w-lg mx-auto mb-6 md:mb-8 leading-relaxed animate-fade-up delay-200 mt-2 px-2" style={{ textShadow: '0 3px 10px rgba(0,0,0,0.8), 0 2px 6px rgba(0,0,0,0.6)' }}>
              A plataforma pioneira de encontros presenciais que utiliza IA para identificar seu match com maior potencial. Acreditamos que há alguém procurando exatamente por você.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-3 animate-fade-up delay-300">
              <Button variant="hero" size="lg" asChild>
                <a href="#proximo-evento">Garantir Meu Lugar</a>
              </Button>
              <Button variant="wine" size="md" asChild>
                <a href="#como-funciona">Saiba Mais</a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to push image down */}
      <div className="flex-1" />

    </section>
  );
};
