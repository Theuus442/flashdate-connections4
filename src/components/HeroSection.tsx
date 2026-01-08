import { Button } from '@/components/ui/button';

export const HeroSection = () => {
  return (
    <section
      id="home"
      className="relative min-h-full flex flex-col"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2F45cbd39582f34d9083b683ebe80d9531%2Feb5bfdd83d90414790c6d2beeb9ef7ac?format=webp&width=1920"
          alt="Flashdate - Encontros elegantes"
          className="w-full h-full object-cover"
          style={{ objectPosition: '-150px 50%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/30" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-muted/10 rounded-full blur-3xl animate-float delay-300" />

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center pt-24 pb-32">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Main Title */}
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-8 animate-fade-up delay-100 drop-shadow-lg">
              <span className="text-white drop-shadow-md block mb-2">FlashDate</span>
              <span className="text-white drop-shadow-md">
                <span className="text-gradient-wine">Encontros Reais</span>, utilizando
              </span>
              <br />
              <span className="text-gradient-wine block">Inteligência Artificial</span>
              <span className="text-white drop-shadow-md">para conexões verdadeiras</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-up delay-200 drop-shadow-md">
              A plataforma pioneira de encontros presenciais que utiliza IA para identificar seu match
              com maior potencial. Acreditamos que há alguém procurando exatamente por você.
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
