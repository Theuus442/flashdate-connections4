import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Phone, Mail, Search, MapPin, Calendar, Clock, Music, Shirt, Users } from 'lucide-react';
import { toast } from 'sonner';
import { sendLGBTSignupEmail } from '@/lib/email.service';
import { eventsService, EventData } from '@/lib/events.service';
import { isSupabaseConfigured } from '@/lib/supabase';

interface Estado {
  id: number;
  nome: string;
  sigla: string;
}

interface Municipio {
  id: number;
  nome: string;
}

export const LGBTSection = () => {
  const supabaseConfigured = isSupabaseConfigured();
  
  // Events state
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    identidadeGenero: '',
    orientacao: '',
    generoBusca: [] as string[],
    estado: '',
    cidade: '',
  });

  const [estados, setEstados] = useState<Estado[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(true);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

  // Load events
  useEffect(() => {
    const loadEvents = async () => {
      setEventsLoading(true);
      try {
        if (supabaseConfigured) {
          const { data, error } = await eventsService.getEvents();
          if (data && data.length > 0) {
            // Filter only LGBT+ exclusive events
            const lgbtEvents = data.filter(event => event.isLgbtOnly);
            setEvents(lgbtEvents);
          }
        }
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setEventsLoading(false);
      }
    };

    loadEvents();
  }, [supabaseConfigured]);

  const selectedEvent = events.find(e => e.id === selectedEventId) || null;

  // Fetch estados from IBGE API
  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
        const data = await response.json();
        setEstados(data);
      } catch (error) {
        console.error('Erro ao carregar estados:', error);
        toast.error('Erro ao carregar estados');
      } finally {
        setLoadingEstados(false);
      }
    };

    fetchEstados();
  }, []);

  // Fetch municipios when estado changes
  useEffect(() => {
    if (formData.estado) {
      const fetchMunicipios = async () => {
        setLoadingMunicipios(true);
        try {
          const estadoSigla = estados.find(e => e.id.toString() === formData.estado)?.sigla;
          if (estadoSigla) {
            const response = await fetch(
              `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSigla}/municipios?orderBy=nome`
            );
            const data = await response.json();
            setMunicipios(data);
          }
        } catch (error) {
          console.error('Erro ao carregar municípios:', error);
          toast.error('Erro ao carregar cidades');
        } finally {
          setLoadingMunicipios(false);
        }
      };

      fetchMunicipios();
    }
  }, [formData.estado, estados]);

  const handleEstadoChange = (estadoId: string) => {
    setFormData({ ...formData, estado: estadoId, cidade: '' });
  };

  const toggleCheckbox = (field: 'generoBusca', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.email || !formData.estado || !formData.cidade) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (!formData.identidadeGenero) {
      toast.error('Por favor, selecione sua identidade de gênero');
      return;
    }

    if (!formData.orientacao) {
      toast.error('Por favor, selecione sua orientação sexual');
      return;
    }

    if (formData.generoBusca.length === 0) {
      toast.error('Por favor, selecione o(s) gênero(s) que você busca');
      return;
    }

    try {
      await sendLGBTSignupEmail(formData);

      toast.success('Cadastro realizado com sucesso! Entraremos em contato em breve.');
      setFormData({
        nome: '',
        email: '',
        whatsapp: '',
        identidadeGenero: '',
        orientacao: '',
        generoBusca: [],
        estado: '',
        cidade: '',
      });
      setMunicipios([]);
    } catch (error) {
      toast.error('Erro ao enviar cadastro. Tente novamente.');
      console.error('Erro:', error);
    }
  };

  const formatWhatsAppNumber = (number: string) => {
    if (!number) return '';
    let cleaned = number.replace(/\D/g, '');
    if (!cleaned.startsWith('55')) {
      cleaned = '55' + cleaned;
    }
    return cleaned;
  };

  const displayWhatsAppNumber = (number: string) => {
    if (!number) return '';
    let cleaned = number.replace(/\D/g, '');
    if (!cleaned.startsWith('55')) {
      cleaned = '55' + cleaned;
    }
    if (cleaned.length === 13) {
      return `+${cleaned.slice(0,2)} ${cleaned.slice(2,4)} ${cleaned.slice(4,9)}-${cleaned.slice(9)}`;
    } else if (cleaned.length === 12) {
      return `+${cleaned.slice(0,2)} ${cleaned.slice(2,4)} ${cleaned.slice(4,8)}-${cleaned.slice(8)}`;
    }
    return `+${cleaned}`;
  };

  return (
    <section id="lgbtq" className="min-h-full bg-background relative flex flex-col">
      {/* Rainbow Gradient Accent - LGBT Pride */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary via-muted to-primary-dark" />

      <div className="absolute -top-40 right-0 w-96 h-96 bg-gradient-to-br from-muted/15 via-primary/10 to-secondary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10 pt-8">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="mb-6 flex justify-center">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F8f3ace03e7c74437bf1e2c3a827303bb%2Fcdf15e9fbd634b2b9f32103afe9bf383?format=webp&width=800"
                alt="LGBT+ Pride"
                className="h-48 w-auto"
              />
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-medium tracking-widest uppercase mb-4">
              <span className="text-2xl">🏳️‍🌈</span>
              <span className="bg-gradient-to-r from-primary via-secondary via-muted to-primary-light bg-clip-text text-transparent">
                Comunidade LGBT+
              </span>
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
              Amor Sem <span className="text-gradient-gold">Fronteiras</span>
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              <p className="text-muted-foreground text-lg leading-relaxed">
                🏳️‍🌈 <span className="font-semibold text-foreground">Este setor é dedicado à comunidade LGBT+.</span>
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Considerando que aproximadamente <span className="text-gold font-semibold">12% da população brasileira</span> se identifica como LGBT+, e para que a <span className="text-gold font-semibold">Inteligência Artificial (IA)</span> do Flashdate possa unir casais compatíveis <span className="text-gold font-semibold">independente do sexo</span> — afinal, essa é nossa missão — precisamos aumentar nossa base de dados.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Sua inscrição é <span className="text-gold font-semibold">vital</span> e manterá a comunidade ativa para o benefício de todos.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Preencha com seus dados abaixo para se manter informado dos próximos eventos e não perder a chance do seu <span className="text-gold font-semibold">match perfeito.</span>
              </p>
            </div>
          </div>

          {/* Events Section */}
          {events.length > 0 && (
            <div className="mb-16 space-y-8">
              <div className="text-center mb-8">
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Próximos Eventos LGBT+
                </h3>
                <p className="text-muted-foreground">Escolha um evento e reserve sua vaga</p>
              </div>

              {/* Events Grid with Expandable Cards */}
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
                        src={event.eventImage}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col justify-end p-4">
                        <h3 className="font-serif text-xl font-bold text-white mb-1">{event.title}</h3>
                        {event.lgbtType && (
                          <div className="text-white/90 text-xs font-semibold mb-2">
                            🏳️‍🌈 {event.lgbtType}
                          </div>
                        )}
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
                  <div className="bg-card-gradient rounded-3xl border border-secondary/20 overflow-hidden shadow-elegant animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="grid md:grid-cols-2 gap-8 p-6 md:p-12">
                      {/* Image */}
                      <div className="relative overflow-hidden rounded-2xl h-96">
                        <img
                          src={selectedEvent.eventImage}
                          alt={selectedEvent.title}
                          className="w-full h-full object-cover"
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
                            {selectedEvent.lgbtType && (
                              <div className="mt-3 inline-block bg-pink-100 text-pink-900 px-3 py-1 rounded-full text-sm font-semibold">
                                🏳️‍🌈 {selectedEvent.lgbtType}
                              </div>
                            )}
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
                                <p className="text-xs text-muted-foreground">Data</p>
                                <p className="text-sm font-semibold text-foreground">{selectedEvent.date}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <Clock className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">Horário</p>
                                <p className="text-sm font-semibold text-foreground">{selectedEvent.schedule}</p>
                                <p className="text-xs text-primary mt-1">Check-in: {selectedEvent.checkIn}</p>
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
            </div>
          )}

          {/* Form Card */}
          <div className="bg-card rounded-3xl border border-border p-8 md:p-12 shadow-elegant">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info */}
              <div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-6">Informações Pessoais</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Nome *</label>
                    <Input
                      type="text"
                      placeholder="Seu nome completo"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Whatsapp<span className="text-xs text-muted-foreground">(opcional, via whatsapp)</span></label>
                    <Input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Gender Identity */}
              <div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-4">1. Identificação de Gênero <span className="text-sm font-normal text-gold">*</span></h3>
                <RadioGroup value={formData.identidadeGenero} onValueChange={(value) => setFormData({ ...formData, identidadeGenero: value })}>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { value: 'masculino', label: 'Masculino' },
                      { value: 'feminino', label: 'Feminino' },
                      { value: 'homem-trans', label: 'Homem Trans' },
                      { value: 'mulher-trans', label: 'Mulher Trans' },
                      { value: 'nao-binario', label: 'Não-Binário' },
                      { value: 'outro', label: 'Outro / Prefiro Não Dizer' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-gold/40 cursor-pointer transition-colors">
                        <RadioGroupItem value={option.value} id={`identidade-${option.value}`} />
                        <span className="text-sm text-foreground">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Sexual Orientation */}
              <div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-4">2. Orientação Sexual Principal <span className="text-sm font-normal text-gold">*</span></h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <Select value={formData.orientacao} onValueChange={(value) => setFormData({ ...formData, orientacao: value })}>
                    <SelectTrigger className="col-span-full">
                      <SelectValue placeholder="Selecione sua orientação sexual" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gay">Gay</SelectItem>
                      <SelectItem value="lesbica">Lésbica</SelectItem>
                      <SelectItem value="bissexual">Bissexual</SelectItem>
                      <SelectItem value="pansexual">Pansexual</SelectItem>
                      <SelectItem value="assexual">Assexual</SelectItem>
                      <SelectItem value="outro">Outro / Prefiro Não Dizer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Gender Preference */}
              <div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-4">3. Gênero(s) que você busca <span className="text-sm font-normal text-gold">*</span></h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { value: 'masculino', label: 'Masculino' },
                    { value: 'feminino', label: 'Feminino' },
                    { value: 'homem-trans', label: 'Homem Trans' },
                    { value: 'mulher-trans', label: 'Mulher Trans' },
                    { value: 'nao-binario', label: 'Não-Binário' },
                    { value: 'assexuado', label: 'Assexuado' },
                    { value: 'todos', label: 'Todos os Gêneros', className: 'md:col-span-3' },
                  ].map((option) => (
                    <label 
                      key={option.value} 
                      className={`flex items-center gap-3 p-3 rounded-lg border border-border hover:border-gold/40 cursor-pointer transition-colors ${option.className || ''}`}
                    >
                      <Checkbox
                        checked={formData.generoBusca.includes(option.value)}
                        onCheckedChange={() => toggleCheckbox('generoBusca', option.value)}
                      />
                      <span className="text-sm text-foreground">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-4">4. Localização (Onde pretende participar) <span className="text-sm font-normal text-gold">*</span></h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center justify-between text-sm font-medium text-foreground mb-2">
                      <span>Estado</span>
                      <Search className="w-4 h-4 text-muted-foreground" />
                    </label>
                    <Select value={formData.estado} onValueChange={handleEstadoChange} disabled={loadingEstados}>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingEstados ? "Carregando..." : "Selecione o estado"} />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map((estado) => (
                          <SelectItem key={estado.id} value={estado.id.toString()}>
                            {estado.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="flex items-center justify-between text-sm font-medium text-foreground mb-2">
                      <span>Cidade</span>
                      <Search className="w-4 h-4 text-muted-foreground" />
                    </label>
                    <Select value={formData.cidade} onValueChange={(value) => setFormData({ ...formData, cidade: value })} disabled={!formData.estado || loadingMunicipios}>
                      <SelectTrigger>
                        <SelectValue placeholder={!formData.estado ? "Selecione um estado primeiro" : loadingMunicipios ? "Carregando..." : "Selecione a cidade"} />
                      </SelectTrigger>
                      <SelectContent>
                        {municipios.map((municipio) => (
                          <SelectItem key={municipio.id} value={municipio.nome}>
                            {municipio.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" variant="hero" size="xl" className="w-full">
                Enviar Cadastro
              </Button>
            </form>

            {/* Contact Info */}
            <div className="mt-8 pt-8 border-t border-border grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Para mais informações</p>
                  <a href="mailto:contato@flashdate.com.br" className="text-foreground font-semibold hover:text-gold transition-colors">
                    contato@flashdate.com.br
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Contato direto</p>
                  <a href="https://wa.me/5511941637875" className="text-foreground font-semibold hover:text-gold transition-colors">
                    (11) 94163-7875
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
