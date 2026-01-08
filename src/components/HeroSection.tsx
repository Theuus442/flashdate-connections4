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
          style={{ objectPosition: '35% 50%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/30" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-muted/10 rounded-full blur-3xl animate-float delay-300" />

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center pt-24 pb-32">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            {/* Main Title - Red Background */}
            <div className="bg-red-600 py-4 animate-fade-up delay-100">
              <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl text-white">
                FLASHDATE
              </h1>
            </div>

            {/* Main Content - Yellow Background */}
            <div className="bg-yellow-300 py-8 animate-fade-up delay-200">
              <p className="font-bold text-2xl md:text-3xl text-black leading-relaxed px-4">
                Encontros Reais,<br />
                utilizando IA<br />
                <span className="text-red-600">para conexões<br />verdadeiras</span>
              </p>
            </div>

            {/* Subtitle - Blue Background */}
            <div className="bg-blue-400 py-6 animate-fade-up delay-300">
              <p className="text-white font-medium text-base md:text-lg leading-relaxed px-6">
                A plataforma pioneira de encontros presenciais que utiliza IA para identificar seu match com maior
                potencial. Acreditamos que há alguém procurando exatamente por você.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300 mt-8">
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
