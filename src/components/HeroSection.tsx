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
          style={{ objectPosition: 'center top' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-muted/10 rounded-full blur-3xl animate-float delay-300" />

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Main Title */}
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-3 animate-fade-up delay-100" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)', transform: 'translateY(39px)' }}>
              <span className="text-white block mb-2">FlashDate.</span>
              <div className="space-y-0">
                <div className="text-white">
                  <span style={{ color: '#ff3366' }}>Encontros Reais</span>,
                </div>
                <div className="text-white">
                  utilizando
                </div>
                <div style={{ color: '#ff3366' }}>
                  Inteligência Artificial
                </div>
                <div className="text-white">
                  para conexões verdadeiras
                </div>
              </div>
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-lg text-gray-200 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-up delay-200 mt-4" style={{ textShadow: '0 3px 10px rgba(0,0,0,0.8), 0 2px 6px rgba(0,0,0,0.6)' }}>
              A plataforma pioneira de encontros presenciais que utiliza IA para identificar seu match com maior potencial. Acreditamos que há alguém procurando exatamente por você.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
              <Button variant="hero" size="xl" asChild>
                <a href="#proximo-evento">Garantir Meu Lugar</a>
              </Button>
              <Button variant="wine" size="lg" asChild>
                <a href="#como-funciona">Saiba Mais</a>
              </Button>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};
