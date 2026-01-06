import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, Users, Music, Shirt, CreditCard } from 'lucide-react';

export const NextEventSection = () => {
  return (
    <section id="proximo-evento" className="py-24 bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-wine/15 via-transparent to-transparent" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-gold text-sm font-medium tracking-widest uppercase mb-4">
            Reserve Sua Vaga
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Próximo <span className="text-gradient-gold">Evento</span>
          </h2>
        </div>

        {/* Event Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-card-gradient rounded-3xl border border-gold/20 overflow-hidden shadow-elegant">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-wine via-wine-dark to-wine p-6 text-center">
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
                Armazém São Caetano
              </h3>
              <p className="text-primary-foreground/80 text-sm">Uma Noite Inspirada em Veneza</p>
            </div>

            {/* Content */}
            <div className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 mb-10">
                {/* Location & Date */}
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Local</h4>
                      <p className="text-muted-foreground text-sm">
                        Rua Piauí, 248 - Santa Paula<br />
                        São Caetano do Sul, SP
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Data</h4>
                      <p className="text-muted-foreground text-sm">31 de Janeiro, 2026</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Horário</h4>
                      <p className="text-muted-foreground text-sm">17:00h às 19:00h</p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Público</h4>
                      <p className="text-muted-foreground text-sm">30 a 45 anos</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <Music className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Ambiente</h4>
                      <p className="text-muted-foreground text-sm">
                        Ambiente rústico, inspirado em Veneza<br />
                        Música ao vivo a partir das 19h
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <Shirt className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Dress Code</h4>
                      <p className="text-muted-foreground text-sm">Esporte Fino / Casual Elegante</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dress Code Warning */}
              <div className="p-4 rounded-xl bg-wine/10 border border-wine/20 mb-8">
                <p className="text-sm text-foreground/80 text-center">
                  <strong className="text-wine-light">Atenção ao Traje:</strong> Proibido roupas de academia, chinelos, regatas, bonés e bermudas.
                </p>
              </div>

              {/* Price & CTA */}
              <div className="text-center border-t border-border pt-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-gold" />
                  <span className="text-sm text-muted-foreground">Valor Promocional</span>
                </div>
                <div className="mb-6">
                  <span className="font-serif text-5xl font-bold text-gradient-gold">R$ 40</span>
                  <span className="text-muted-foreground text-sm ml-2">(não reembolsável)</span>
                </div>
                <p className="text-muted-foreground text-sm mb-6">
                  <strong className="text-foreground">Pix:</strong> 11 97032 9710
                </p>
                <Button variant="hero" size="xl" asChild>
                  <a href="mailto:contato@flashdate.com.br?subject=Inscrição%20Flashdate%2031/01">
                    Garantir Minha Vaga
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
