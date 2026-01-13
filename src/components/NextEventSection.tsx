import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, Users, Music, Shirt, CreditCard, AlertCircle, Phone, Mail, Clock8 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { eventsService, EventData } from '@/lib/events.service';
import { isSupabaseConfigured } from '@/lib/supabase';
import venueImage from '@/assets/WhatsApp Image 2026-01-05 at 21.51.33.jpeg';

export const NextEventSection = () => {
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [event, setEvent] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabaseConfigured = isSupabaseConfigured();

  useEffect(() => {
    const loadEvent = async () => {
      setIsLoading(true);
      try {
        if (supabaseConfigured) {
          const { data, error } = await eventsService.getEvents();
          if (data && data.length > 0) {
            setEvent(data[0]);
          }
        }
      } catch (error) {
        console.error('Error loading event:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [supabaseConfigured]);

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
          {isLoading ? (
            <div className="bg-card-gradient rounded-3xl border border-secondary/20 overflow-hidden shadow-elegant p-12 text-center">
              <p className="text-muted-foreground">Carregando próximo evento...</p>
            </div>
          ) : event ? (
            <div className="bg-card-gradient rounded-3xl border border-secondary/20 overflow-hidden shadow-elegant">
              {/* Venue Image */}
              <div className="relative w-full overflow-hidden rounded-t-3xl" style={{aspectRatio: '16/9', maxHeight: '350px'}}>
                <img
                  src={event.eventImage || venueImage}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('[NextEventSection] Error loading event image:', event.eventImage);
                    // Fallback to default image
                    (e.target as HTMLImageElement).src = venueImage;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
              </div>

              {/* Header Banner */}
              <div className="bg-gradient-to-r from-primary via-primary-light to-primary p-6 text-center">
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2">
                  {event.title}
                </h3>
                <p className="text-white/80 text-sm">{event.description}</p>
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
                        <p className="text-muted-foreground text-sm">{event.location}</p>
                        {event.city && <p className="text-muted-foreground text-sm">{event.city}</p>}
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Data</h4>
                        <p className="text-muted-foreground text-sm">{event.date}</p>
                        <p className="text-wine font-semibold text-xs mt-1">{event.nextDate}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Horário</h4>
                        <p className="text-muted-foreground text-sm">{event.schedule}</p>
                        <p className="text-wine font-semibold text-xs mt-1">Check-in: {event.checkIn}</p>
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
                        <p className="text-muted-foreground text-sm">{event.environment}</p>
                        {event.music && <p className="text-muted-foreground text-sm mt-1">{event.music}</p>}
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <Shirt className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Dress Code</h4>
                        <p className="text-muted-foreground text-sm">{event.dressCode}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Estacionamento</h4>
                        <p className="text-muted-foreground text-sm">{event.parking}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Warnings */}
                <div className="space-y-4 mb-10">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                    <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-foreground mb-1">Valor: {event.price}</p>
                      <p className="text-muted-foreground">Pagamento via Pix: {event.whatsapp}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-foreground mb-1">Garanta sua vaga até: {event.vagasLimitDate}</p>
                      <p className="text-muted-foreground">Vagas limitadas</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                    <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-foreground mb-1">Após o pagamento</p>
                      <p className="text-muted-foreground">Acesse a aba <a href="#como-funciona" className="text-wine font-semibold hover:underline">Como Funciona</a> para saber os próximos passos</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                    <Clock8 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-foreground mb-1">Horário do Evento</p>
                      <p className="text-muted-foreground">{event.schedule} (chegue com 15-30 min de antecedência para o check-in)</p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid md:grid-cols-2 gap-4 mb-10 p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-start gap-3 min-w-0">
                    <Mail className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <a href={`mailto:${event.email}`} className="text-foreground font-semibold hover:text-wine transition-colors break-all">
                        {event.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 min-w-0">
                    <Phone className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">WhatsApp</p>
                      <a href={`https://wa.me/${event.whatsapp.replace(/\D/g, '')}`} className="text-foreground font-semibold hover:text-wine transition-colors break-all">
                        {event.whatsapp}
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
                    <span className="font-serif text-5xl font-bold text-gradient-wine">{event.price}</span>
                  </div>
                  <div className="flex justify-center">
                    <Button variant="hero" size="xl" className="w-full sm:w-auto" asChild>
                      <a href={`https://wa.me/${event.whatsapp.replace(/\D/g, '')}?text=Olá! Gostaria de me inscrever no próximo evento Flashdate.`}>
                        Garantir Minha Vaga
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card-gradient rounded-3xl border border-secondary/20 overflow-hidden shadow-elegant p-12 text-center">
              <p className="text-muted-foreground">Nenhum evento disponível no momento</p>
            </div>
          )}
        </div>

        {/* Newsletter Section */}
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-primary/25 to-primary-dark/25 rounded-3xl border border-border/30 p-8 md:p-12">
          <h3 className="font-serif text-3xl font-bold text-foreground mb-4 text-center">
            Cadastre seu Email
          </h3>
          <p className="text-muted-foreground text-center mb-8">
            Receba informações dos próximos eventos nas cidades abaixo
          </p>

          {/* City Images */}
          <div className="grid md:grid-cols-4 gap-4 mb-10">
            <div className="rounded-xl overflow-hidden border border-border">
              <img src="https://cdn.builder.io/api/v1/image/assets%2F58e8805b75844176990ce5b2f20e1469%2Ffbe03bdc245d498c92b9e01bddadaa43?format=webp&width=800" alt="São Paulo" className="w-full h-48 object-cover" />
            </div>
            <div className="rounded-xl overflow-hidden border border-border">
              <img src="https://cdn.builder.io/api/v1/image/assets%2F58e8805b75844176990ce5b2f20e1469%2F17e69ed45f994286a1d1220397d4c2f7?format=webp&width=800" alt="Santo André" className="w-full h-48 object-cover" />
            </div>
            <div className="rounded-xl overflow-hidden border border-border">
              <img src="https://cdn.builder.io/api/v1/image/assets%2F58e8805b75844176990ce5b2f20e1469%2F10ba3cebab1d404eb68ef4fa2a495e75?format=webp&width=800" alt="São Bernardo" className="w-full h-48 object-cover" />
            </div>
            <div className="rounded-xl overflow-hidden border border-border">
              <img src="https://cdn.builder.io/api/v1/image/assets%2F58e8805b75844176990ce5b2f20e1469%2F66ddd424e55144a09140cb7cc4994470?format=webp&width=800" alt="São Caetano" className="w-full h-48 object-cover" />
            </div>
          </div>

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
