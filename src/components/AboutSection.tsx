import { GraduationCap, Globe, Heart, Sparkles } from 'lucide-react';

export const AboutSection = () => {
  return (
    <section id="sobre" className="py-24 bg-elegant-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-wine/15 via-transparent to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-gold text-sm font-medium tracking-widest uppercase mb-4">
            Nossa História
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Sobre <span className="text-gradient-gold">Nós</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Speed Dating Premium
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            {/* Founder Info */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-3xl p-8 border border-border shadow-elegant text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-wine to-wine-dark flex items-center justify-center mx-auto mb-6">
                  <span className="font-serif text-3xl text-gold font-bold">SN</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
                  Sidnei Nunes
                </h3>
                <p className="text-gold text-sm font-medium mb-4">Fundador & CEO</p>
                
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <Globe className="w-5 h-5 text-gold flex-shrink-0" />
                    <span className="text-sm text-foreground/80">10 anos na Austrália</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <GraduationCap className="w-5 h-5 text-gold flex-shrink-0" />
                    <span className="text-sm text-foreground/80">Mestrado em Análise de Negócios</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Story */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Heart className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="font-serif text-xl font-bold text-foreground mb-2">
                    A Origem
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Após uma década vivendo na Austrália e completando seu Mestrado em Análise de Negócios, 
                    Sidnei Nunes percebeu uma lacuna no mercado de relacionamentos: a falta de conexões 
                    genuínas em um mundo dominado por aplicativos superficiais.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="font-serif text-xl font-bold text-foreground mb-2">
                    O Diferencial Flashdate
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Enquanto apps freemium lucram mantendo você solteiro e engajado, o Flashdate tem um 
                    objetivo claro: <span className="text-gold font-semibold">encontrar seu match perfeito</span>. 
                    Nossa IA não manipula resultados – ela genuinamente busca a compatibilidade ideal para cada participante.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-wine/20 to-gold/10 border border-gold/20">
                <blockquote className="font-serif text-lg text-foreground italic">
                  "Acreditamos que a tecnologia deve servir ao amor, não explorá-lo. 
                  Cada match é uma história que pode começar – e nossa missão é fazer essa história acontecer."
                </blockquote>
                <p className="text-gold text-sm mt-3 font-medium">— Sidnei Nunes, Fundador</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
