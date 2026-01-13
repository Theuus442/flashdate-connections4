import { GraduationCap, Globe, Heart, Sparkles } from 'lucide-react';

export const AboutSection = () => {
  return (
    <section id="sobre" className="min-h-full bg-background relative flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-muted/15 via-transparent to-transparent" />

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
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-6">
                  <span className="font-serif text-3xl text-white font-bold">SN</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
                  Sidnei Nunes
                </h3>
                <p className="text-gold text-sm font-medium mb-4">Fundador & CEO</p>
                
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <Globe className="w-5 h-5 text-gold flex-shrink-0" />
                    <span className="text-sm text-foreground/80">Por 10 anos de Austrália</span>
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
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  O <span className="text-gold font-semibold">Flashdate</span> nasceu da crença de que a tecnologia deve nos aproximar, não nos afastar.
                </p>

                <p className="text-muted-foreground leading-relaxed">
                  Nosso fundador, o empreendedor brasileiro <span className="font-semibold text-foreground">Sidnei Nunes</span>, trouxe uma visão inovadora após 10 anos na Austrália, onde completou um Mestrado em Análise de Negócios. Ele notou dois problemas cruciais no mercado:
                </p>

                <div className="space-y-3 pl-4 border-l-2 border-gold/50">
                  <div>
                    <p className="text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Os aplicativos tradicionais</span> falhavam, muitas vezes priorizando apenas o lucro e, consequentemente, entregando frustração e incompatibilidade.
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">O popular modelo de Speed Dating Australiano</span> era eficiente no encontro, mas não se preocupava com a real compatibilidade entre os participantes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="font-serif text-xl font-bold text-foreground mb-3">
                    A Solução
                  </h4>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Criar um modelo mais humano, eficiente e moderno. Inspirado na eficácia do encontro presencial,
                    o <span className="text-gold font-semibold">Flashdate</span> adiciona a tecnologia de ponta ao processo.
                    Usamos <span className="font-semibold">Inteligência Artificial (IA)</span> para ir além de toques de tela
                    (swipes) e fotos superficiais.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Nossa IA analisa dados complexos para sugerir encontros que possuem o maior potencial de compatibilidade real,
                    resolvendo o problema global de conectar pessoas de forma significativa.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-red-400/10 to-yellow-400/10 border border-secondary/20">
                <blockquote className="font-serif text-lg text-foreground italic">
                  "Somos a ponte que une o calor do encontro presencial à precisão da tecnologia mais avançada."
                </blockquote>
                <p className="text-secondary text-sm mt-3 font-medium">— Sidnei Nunes, Fundador</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
