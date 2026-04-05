import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, Users, Music, Shirt, CreditCard, AlertCircle, Phone, Mail, Clock8 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { eventsService, EventData } from '@/lib/events.service';
import { isSupabaseConfigured } from '@/lib/supabase';
import venueImage from '@/assets/WhatsApp Image 2026-01-05 at 21.51.33.jpeg';
import { parse, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Format date to Brazilian format (DD/MM/YYYY)
const formatDateToBR = (dateString: string): string => {
  if (!dateString) return '';
  try {
    // Check if it's already in DD/MM/YYYY format
    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return dateString;
    }
    // Try parsing YYYY-MM-DD format
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = parse(dateString, 'yyyy-MM-dd', new Date());
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    }
    return dateString;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

export const NextEventSection = () => {
    // Garante que o número tenha o prefixo +55
    const formatWhatsAppNumber = (number: string) => {
      if (!number) return '';
      let cleaned = number.replace(/\D/g, '');
      if (!cleaned.startsWith('55')) {
        cleaned = '55' + cleaned;
      }
      return cleaned;
    };

    // Exibe o número formatado com +55 (ex: +55 11 94163-7875)
    const displayWhatsAppNumber = (number: string) => {
      if (!number) return '';
      let cleaned = number.replace(/\D/g, '');
      if (!cleaned.startsWith('55')) {
        cleaned = '55' + cleaned;
      }
      // Formatação: +55 11 94163-7875
      if (cleaned.length === 13) {
        return `+${cleaned.slice(0,2)} ${cleaned.slice(2,4)} ${cleaned.slice(4,9)}-${cleaned.slice(9)}`;
      } else if (cleaned.length === 12) {
        return `+${cleaned.slice(0,2)} ${cleaned.slice(2,4)} ${cleaned.slice(4,8)}-${cleaned.slice(8)}`;
      }
      return `+${cleaned}`;
    };
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const eventDetailsRef = useRef<HTMLDivElement | null>(null);
  const supabaseConfigured = isSupabaseConfigured();

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      try {
        if (supabaseConfigured) {
          const { data, error } = await eventsService.getEvents();
          if (data && data.length > 0) {
            setEvents(data);
          }
        }
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [supabaseConfigured]);

  // Auto-scroll to event details when selected
  useEffect(() => {
    if (selectedEventId && eventDetailsRef.current) {
      // Usar um delay maior para garantir que o DOM foi renderizado
      const timer = setTimeout(() => {
        if (eventDetailsRef.current) {
          eventDetailsRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [selectedEventId]);

  const selectedEvent = events.find(e => e.id === selectedEventId) || null;

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

        {/* Events Grid with Expandable Cards */}
        <div className="max-w-6xl mx-auto mb-16">
          {isLoading ? (
            <div className="bg-card-gradient rounded-3xl border border-secondary/20 overflow-hidden shadow-elegant p-12 text-center">
              <p className="text-muted-foreground">Carregando eventos...</p>
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-8">
              {/* Events Grid - Thumbnails */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEventId(event.id)}
                    className={`relative group overflow-hidden rounded-2xl border-2 transition-all duration-300 h-64 ${
                      selectedEventId === event.id
                        ? 'border-primary shadow-elegant col-span-full lg:col-span-1'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {/* Image */}
                    <img
                      src={event.eventImage || venueImage}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = venueImage;
                      }}
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4">
                      <h3 className="font-serif text-xl font-bold text-white mb-1">{event.title}</h3>
                      <div className="flex items-center gap-2 text-white/80 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>{event.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
                        <Calendar className="w-4 h-4" />
                        <span>{event.date}</span>
                      </div>
                    </div>

                    {/* Selected Indicator */}
                    {selectedEventId === event.id && (
                      <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-primary border-2 border-white" />
                    )}
                  </button>
                ))}
              </div>

              {/* Expanded Event Details */}
              {selectedEvent && (
                <div 
                  ref={eventDetailsRef}
                  className="bg-card-gradient rounded-3xl border border-secondary/20 overflow-hidden shadow-elegant animate-in fade-in slide-in-from-bottom-4 duration-300"
                >
                  <div className="grid md:grid-cols-2 gap-8 p-6 md:p-12">
                    {/* Image */}
                    <div className="relative overflow-hidden rounded-2xl h-96">
                      <img
                        src={selectedEvent.eventImage || venueImage}
                        alt={selectedEvent.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = venueImage;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>

                    {/* Details */}
                    <div className="flex flex-col justify-between">
                      <div className="space-y-6">
                        {/* Header */}
                        <div>
                          <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
                            {selectedEvent.title}
                          </h2>
                          <p className="text-muted-foreground text-base">{selectedEvent.description}</p>
                        </div>

                        {/* Info Grid */}
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground">Local</p>
                              <p className="text-sm font-semibold text-foreground">{selectedEvent.location}</p>
                              {selectedEvent.city && <p className="text-xs text-muted-foreground">{selectedEvent.city}</p>}
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Data/Frequência</p>
                              <p className="text-sm font-semibold text-foreground">{selectedEvent.date}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Horário</p>
                              <p className="text-sm font-semibold text-foreground">{selectedEvent.schedule}</p>
                              <p className="text-xs text-wine mt-1">Check-in: {selectedEvent.checkIn}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Music className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground">Ambiente</p>
                              <p className="text-sm font-semibold text-foreground">{selectedEvent.environment}</p>
                              {selectedEvent.music && <p className="text-xs text-muted-foreground mt-1">{selectedEvent.music}</p>}
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Shirt className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Dress Code</p>
                              <p className="text-sm font-semibold text-foreground">{selectedEvent.dressCode}</p>
                            </div>
                          </div>

                          {selectedEvent.ageRange && (
                            <div className="flex items-start gap-3">
                              <Users className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">Faixa Etária</p>
                                <p className="text-sm font-semibold text-foreground">{selectedEvent.ageRange}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price & CTA */}
                      <div className="flex items-end justify-between gap-4 pt-6 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Valor do Evento</p>
                          <p className="text-3xl font-bold text-gradient-wine">{selectedEvent.price}</p>
                        </div>
                        <div className="space-y-2 flex-1">
                          <Button variant="hero" size="sm" className="w-full" asChild>
                            <a href={`https://wa.me/${formatWhatsAppNumber(selectedEvent.whatsapp)}?text=Olá! Gostaria de me inscrever no evento: ${selectedEvent.title}`}>
                              Garantir Vaga
                            </a>
                          </Button>
                          <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedEventId(null)}>
                            Fechar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
