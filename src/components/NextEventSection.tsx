import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, Users, Music, Shirt, CreditCard, AlertCircle, Phone, Mail, Clock8 } from 'lucide-react';
import { useState } from 'react';
import venueImage from '@/assets/WhatsApp Image 2026-01-05 at 21.51.33.jpeg';

export const NextEventSection = () => {
  const [selectedCities, setSelectedCities] = useState<string[]>([]);

  const cities = [
    { name: 'São Paulo', id: 'sp' },
    { name: 'Santo André', id: 'sa' },
    { name: 'São Bernardo', id: 'sb' },
    { name: 'São Caetano', id: 'sc' },
  ];

  const toggleCity = (cityId: string) => {
    setSelectedCities(prev =>
      prev.includes(cityId)
        ? prev.filter(id => id !== cityId)
        : [...prev, cityId]
    );
  };

  return (
    <section id="proximo-evento" className="min-h-full bg-background relative flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/8 via-transparent to-transparent" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-wine text-sm font-medium tracking-widest uppercase mb-4">
            Reserve Sua Vaga
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Próximo <span className="text-gradient-wine">Evento</span>
          </h2>
        </div>

        {/* Event Card */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="bg-card-gradient rounded-3xl border border-secondary/20 overflow-hidden shadow-elegant">
            {/* Venue Image */}
            <div className="relative w-full overflow-hidden rounded-t-3xl" style={{aspectRatio: '16/9', maxHeight: '350px'}}>
              <img
                src={venueImage}
                alt="Armazém São Caetano"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            </div>

            {/* Header Banner */}
            <div className="bg-gradient-to-r from-primary via-primary-light to-primary p-6 text-center">
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2">
                Armazém São Caetano
              </h3>
              <p className="text-white/80 text-sm">Encontros Presenciais com Inteligência Artificial</p>
            </div>

            {/* Content */}
            <div className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 mb-10">
                {/* Location & Date */}
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Local</h4>
                      <p className="text-muted-foreground text-sm">
                        Armazém São Caetano<br />
                        Rua Piauí, 248 - Santa Paula<br />
                        São Caetano do Sul - SP, 09541-150
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Data</h4>
                      <p className="text-muted-foreground text-sm">Sábado</p>
                      <p className="text-wine font-semibold text-xs mt-1">25/01/2026</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Horário</h4>
                      <p className="text-muted-foreground text-sm">17:00hs às 19:00hs</p>
                      <p className="text-wine font-semibold text-xs mt-1">Check-in: 15-30 min antes</p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Music className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Ambiente</h4>
                      <p className="text-muted-foreground text-sm">
                        Rústico e elegante<br />
                        Música ao vivo a partir das 19h
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Shirt className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Dress Code</h4>
                      <p className="text-muted-foreground text-sm">Esporte Fino / Casual Elegante</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Estacionamento</h4>
                      <p className="text-muted-foreground text-sm">
                        Zona Azul gratuita a partir das 13h<br />
                        (aos sábados)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Warnings */}
              <div className="space-y-4 mb-10">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                  <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-foreground mb-1">Valor Promocional: R$40,00</p>
                    <p className="text-muted-foreground">(não reembolsável por desistência)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-foreground mb-1">Garanta sua Vaga até 25/01/2026</p>
                    <p className="text-muted-foreground">Vagas limitadas. Pix: (11) 97032-9710</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                  <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-foreground mb-1">Não há venda no local</p>
                    <p className="text-muted-foreground">Pagamento antecipado é obrigatório</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                  <Clock8 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-foreground mb-1">Dica Extra: Música ao Vivo!</p>
                    <p className="text-muted-foreground">Após o evento, aproveite a música ao vivo a partir das 19h com seus matches</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid md:grid-cols-2 gap-4 mb-10 p-4 rounded-xl bg-card border border-border">
                <div className="flex items-start gap-3 min-w-0">
                  <Mail className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <a href="mailto:contato@flashdate.com.br" className="text-foreground font-semibold hover:text-wine transition-colors break-all">
                      contato@flashdate.com.br
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3 min-w-0">
                  <Phone className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">WhatsApp</p>
                    <a href="https://wa.me/5511970329710" className="text-foreground font-semibold hover:text-wine transition-colors break-all">
                      (11) 97032-9710
                    </a>
                  </div>
                </div>
              </div>

              {/* Price & CTA */}
              <div className="text-center border-t border-border pt-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-secondary" />
                  <span className="text-sm text-muted-foreground">Valor Promocional</span>
                </div>
                <div className="mb-6">
                  <span className="font-serif text-5xl font-bold text-gradient-wine">R$ 40</span>
                </div>
                <div className="flex justify-center">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto" asChild>
                    <a href="https://wa.me/5511970329710?text=Olá! Gostaria de me inscrever no próximo evento Flashdate.">
                      Garantir Minha Vaga
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-primary/25 to-primary-dark/25 rounded-3xl border border-border/30 p-8 md:p-12">
          <h3 className="font-serif text-3xl font-bold text-foreground mb-4 text-center">
            Cadastre seu Email
          </h3>
          <p className="text-muted-foreground text-center mb-8">
            Receba informações dos próximos eventos nas cidades abaixo
          </p>

          {/* City Selection */}
          <div className="grid md:grid-cols-4 gap-4 mb-10">
            {cities.map(city => (
              <button
                key={city.id}
                onClick={() => toggleCity(city.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 font-semibold ${
                  selectedCities.includes(city.id)
                    ? 'border-secondary bg-secondary/20 text-secondary'
                    : 'border-border bg-card hover:border-secondary/50 text-foreground'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>

          {/* Forms Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* First set of cities */}
            {selectedCities.includes('sp') && (
              <div className="bg-card rounded-xl p-6 border border-border">
                <h4 className="font-semibold text-foreground mb-4 text-lg">São Paulo</h4>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Nome</label>
                    <input type="text" placeholder="Seu nome" className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-wine" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <input type="email" placeholder="seu@email.com" className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-wine" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">WhatsApp (Opcional)</label>
                    <input type="tel" placeholder="(11) 99999-9999" className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-wine" />
                  </div>
                </form>
              </div>
            )}

            {selectedCities.includes('sa') && (
              <div className="bg-card rounded-xl p-6 border border-border">
                <h4 className="font-semibold text-foreground mb-4 text-lg">Santo André</h4>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Nome</label>
                    <input type="text" placeholder="Seu nome" className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-wine" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <input type="email" placeholder="seu@email.com" className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-wine" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">WhatsApp (Opcional)</label>
                    <input type="tel" placeholder="(11) 99999-9999" className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-wine" />
                  </div>
                </form>
              </div>
            )}

            {selectedCities.includes('sb') && (
              <div className="bg-card rounded-xl p-6 border border-border">
                <h4 className="font-semibold text-foreground mb-4 text-lg">São Bernardo</h4>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Nome</label>
                    <input type="text" placeholder="Seu nome" className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-wine" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <input type="email" placeholder="seu@email.com" className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-wine" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">WhatsApp (Opcional)</label>
                    <input type="tel" placeholder="(11) 99999-9999" className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-wine" />
                  </div>
                </form>
              </div>
            )}

            {selectedCities.includes('sc') && (
              <div className="bg-card rounded-xl p-6 border border-border">
                <h4 className="font-semibold text-foreground mb-4 text-lg">São Caetano</h4>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Nome</label>
                    <input type="text" placeholder="Seu nome" className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-wine" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <input type="email" placeholder="seu@email.com" className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-wine" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">WhatsApp (Opcional)</label>
                    <input type="tel" placeholder="(11) 99999-9999" className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-wine" />
                  </div>
                </form>
              </div>
            )}
          </div>

          {selectedCities.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">Selecione as cidades acima para se cadastrar</p>
            </div>
          )}

          {selectedCities.length > 0 && (
            <div className="text-center mt-8">
              <Button variant="hero" size="lg" className="w-full sm:w-auto" asChild>
                <a href="mailto:contato@flashdate.com.br?subject=Cadastro%20para%20Próximos%20Eventos">
                  Enviar Cadastro
                </a>
              </Button>
            </div>
          )}

          {/* Note */}
          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              <strong className="text-foreground">Obs:</strong> Sinta-se à vontade para participar em qualquer uma das nossas cidades,
              independentemente de onde você mora. Onde houver um evento Flashdate, você será bem-vindo!
            </p>
          </div>
        </div>

        {/* Speed Dating Info */}
        <div className="mt-16 max-w-4xl mx-auto bg-card rounded-2xl border border-border p-8 md:p-10">
          <h3 className="font-serif text-2xl font-bold text-foreground mb-6">
            O Modelo Speed Dating
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-4">
            O Speed Dating não é uma novidade: existe há mais de 25 anos porque <span className="text-wine font-semibold">funciona!</span>
            Nós pegamos esse método divertido e super popular em outros países e o trouxemos para o futuro, usando
            <span className="text-wine font-semibold"> Inteligência Artificial</span> para dar aquele empurrãozinho extra na sua compatibilidade.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            <span className="text-wine font-semibold">Chega de perder tempo!</span> Venha conhecer gente interessante, de forma segura e com a
            certeza de que a tecnologia está trabalhando a seu favor para encontrar o seu <span className="text-wine font-semibold">match perfeito.</span>
          </p>
        </div>
      </div>
    </section>
  );
};
