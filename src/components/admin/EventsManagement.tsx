import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, AlertCircle, Search } from 'lucide-react';
import { eventsService, EventData } from '@/lib/events.service';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { searchCities } from '@/lib/cities.service';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Placeholder SVG for when images fail to load
const PLACEHOLDER_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect fill='%23f5f5f5' width='600' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='16' fill='%23999'%3EImagem não pode ser carregada%3C/text%3E%3C/svg%3E`;

// Default event data with template values
const defaultEventData: EventData = {
  id: '1',
  title: 'Armazém São Caetano',
  location: 'Armazém São Caetano',
  city: 'São Caetano do Sul, SP',
  date: 'Sábados com eventos regulares',
  nextDate: '25/01/2026',
  schedule: 'Conforme agendado',
  checkIn: '15-30 min antes',
  environment: 'Rústico e elegante',
  music: 'Música ao vivo a partir das 19h',
  dressCode: 'Esporte Fino / Casual Elegante',
  parking: 'Zona Azul gratuita a partir das 13h (aos sábados)',
  price: 'R$ 40,00',
  description: 'Encontros Presenciais com Inteligência Artificial',
  eventImage: 'https://kdwnptqxwnnzvdinhhin.supabase.co/storage/v1/object/public/events/placeholder.png',
  email: 'contato@flashdate.com.br',
  whatsapp: '(11) 97032-9710',
  vagas: '1',
  vagasLimitDate: '25/01/2026',
};

// Empty form for creating new events
const emptyEventForm: EventData = {
  id: '',
  title: '',
  location: '',
  city: '',
  date: '',
  nextDate: '',
  schedule: '',
  checkIn: '',
  environment: '',
  music: '',
  dressCode: '',
  parking: '',
  price: '',
  description: '',
  eventImage: '',
  email: '',
  whatsapp: '',
  vagas: '',
  vagasLimitDate: '',
};

export const EventsManagement = () => {
  const { toast } = useToast();
  const supabaseConfigured = isSupabaseConfigured();
  const [eventData, setEventData] = useState<EventData>(defaultEventData);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<EventData>(eventData);
  const [imagePreview, setImagePreview] = useState(eventData.eventImage);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [previewLoadError, setPreviewLoadError] = useState(false);
  const [cities, setCities] = useState<Array<{ id: number; nome: string }>>([]);
  const [citySearchInput, setCitySearchInput] = useState('');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  // Load event from Supabase on mount
  useEffect(() => {
    const loadEvent = async () => {
      if (!supabaseConfigured) {
        console.log('[EventsManagement] Supabase not configured, using offline mode');
        return;
      }

      setIsLoading(true);
      try {
        const events = await eventsService.getEvents();
        if (events.data && events.data.length > 0) {
          // Get the first event (or latest)
          const event = events.data[0];
          console.log('[EventsManagement] Loaded event:', event);
          setEventData(event);
          setFormData(event);
          setImagePreview(event.eventImage);
          setImageLoadError(false);
          setPreviewLoadError(false);
        } else {
          console.warn('[EventsManagement] No events found in database');
          toast({
            title: 'Aviso',
            description: 'Nenhum evento encontrado no banco de dados',
            variant: 'default',
          });
        }
      } catch (error) {
        console.error('[EventsManagement] Error loading event:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar evento do banco de dados',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [supabaseConfigured, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCitySearch = async (value: string) => {
    setCitySearchInput(value);
    if (value.length >= 2) {
      try {
        const results = await searchCities(value);
        setCities(results);
        setShowCitySuggestions(true);
      } catch (error) {
        console.error('[EventsManagement] Error searching cities:', error);
      }
    } else {
      setCities([]);
      setShowCitySuggestions(false);
    }
  };

  const handleCitySelect = (cityName: string) => {
    setFormData(prev => ({
      ...prev,
      city: cityName,
    }));
    setCitySearchInput(cityName);
    setShowCitySuggestions(false);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
      // Check if it's already in YYYY-MM-DD format
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }
      // Try parsing as DD/MM/YYYY
      const date = parse(dateString, 'dd/MM/yyyy', new Date());
      return format(date, 'yyyy-MM-dd');
    } catch {
      // If it's already in a different format, return as is
      return dateString;
    }
  };

  const formatDateToDisplay = (dateString: string): string => {
    if (!dateString) return '';
    try {
      // Handle both YYYY-MM-DD and DD/MM/YYYY formats
      let date: Date;
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // YYYY-MM-DD format
        date = new Date(dateString + 'T00:00:00');
      } else {
        // DD/MM/YYYY format
        date = parse(dateString, 'dd/MM/yyyy', new Date());
      }
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string): string => {
    if (!timeString) return '';
    // If it's already in HH:mm format, return as is
    if (timeString.match(/^\d{2}:\d{2}$/)) {
      return timeString;
    }
    // If it contains a time pattern like "19h" or "19:00", try to extract it
    const timeMatch = timeString.match(/(\d{1,2}):?(\d{0,2})/);
    if (timeMatch) {
      const hours = timeMatch[1].padStart(2, '0');
      const minutes = timeMatch[2] ? timeMatch[2].padStart(2, '0') : '00';
      return `${hours}:${minutes}`;
    }
    return timeString;
  };

  const formatPrice = (priceString: string): string => {
    if (!priceString) return '';
    // Remove non-numeric characters except decimal point
    const numericValue = priceString.replace(/[^0-9.,]/g, '');
    // Replace comma with dot for parsing
    const value = parseFloat(numericValue.replace(',', '.'));
    if (isNaN(value)) return priceString;
    // Format as Brazilian currency
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatWhatsApp = (phone: string): string => {
    if (!phone) return '';
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    // Format as (XX) XXXXX-XXXX or (XX) XXXX-XXXX
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setPreviewLoadError(false);
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setImagePreview(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageLoadError = (e: any) => {
    console.error('[EventsManagement] Error loading event image:', {
      url: eventData.eventImage,
      error: e,
    });
    setImageLoadError(true);
  };

  const handlePreviewLoadError = (e: any) => {
    console.error('[EventsManagement] Error loading preview image:', {
      url: imagePreview,
      error: e,
    });
    setPreviewLoadError(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If creating a new event, use handleCreateSubmit instead
    if (isCreating) {
      return handleCreateSubmit(e);
    }

    setIsLoading(true);

    // Validate that event ID exists
    if (!eventData.id) {
      toast({
        title: 'Erro',
        description: 'ID do evento não está disponível. Recarregue a página.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      if (supabaseConfigured) {
        const { data, error } = await eventsService.updateEvent(
          eventData.id,
          formData,
          selectedImageFile || undefined
        );

        if (error) {
          const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
          console.error('[EventsManagement] Error updating event:', errorMsg);
          toast({
            title: 'Erro',
            description: `Falha ao atualizar evento: ${errorMsg}`,
            variant: 'destructive',
          });
          return;
        }

        if (data) {
          setEventData(data);
          setFormData(data);
          setImagePreview(data.eventImage);
          setImageLoadError(false);
          setPreviewLoadError(false);
          setSelectedImageFile(null);
          toast({
            title: 'Sucesso',
            description: 'Evento atualizado com sucesso!',
          });
        }
      } else {
        // Fallback to local update
        setEventData(formData);
        setImagePreview(formData.eventImage);
        setImageLoadError(false);
        setPreviewLoadError(false);
        toast({
          title: 'Sucesso',
          description: 'Evento atualizado (local apenas)',
        });
      }

      setIsEditing(false);
    } catch (error) {
      console.error('[EventsManagement] Error saving event:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar evento',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(eventData);
    setImagePreview(eventData.eventImage);
    setImageLoadError(false);
    setPreviewLoadError(false);
    setSelectedImageFile(null);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setFormData(emptyEventForm);
    setImagePreview('');
    setImageLoadError(false);
    setPreviewLoadError(false);
    setSelectedImageFile(null);
    setIsCreating(true);
    setIsEditing(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate required fields
    if (!formData.title || !formData.email || !formData.whatsapp) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha os campos: Título, Email e WhatsApp',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      if (supabaseConfigured) {
        const { data, error } = await eventsService.createEvent(
          formData,
          selectedImageFile || undefined
        );

        if (error) {
          const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
          console.error('[EventsManagement] Error creating event:', errorMsg);
          toast({
            title: 'Erro',
            description: `Falha ao criar evento: ${errorMsg}`,
            variant: 'destructive',
          });
          return;
        }

        if (data) {
          setEventData(data);
          setFormData(data);
          setImagePreview(data.eventImage);
          setImageLoadError(false);
          setPreviewLoadError(false);
          setSelectedImageFile(null);
          toast({
            title: 'Sucesso',
            description: 'Evento criado com sucesso!',
          });
          setIsEditing(false);
          setIsCreating(false);
        }
      } else {
        // Fallback to local creation
        const newEvent: EventData = {
          ...formData,
          id: Date.now().toString(),
        };
        setEventData(newEvent);
        setFormData(newEvent);
        setImagePreview(formData.eventImage);
        setImageLoadError(false);
        setPreviewLoadError(false);
        toast({
          title: 'Sucesso',
          description: 'Evento criado (local apenas)',
        });
        setIsEditing(false);
        setIsCreating(false);
      }
    } catch (error) {
      console.error('[EventsManagement] Error creating event:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar evento',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !eventData.id) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Carregando evento...</p>
      </div>
    );
  }

  // Show message if no event is loaded and not in loading state, but offer to create one
  if (!isLoading && !eventData.id && !isEditing) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Gerenciar Eventos</h1>
            <p className="text-muted-foreground mt-2">Crie e edite os eventos</p>
          </div>
          <Button variant="gold" onClick={handleCreateNew} disabled={isLoading}>
            + Adicionar Evento
          </Button>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Nenhum evento encontrado</h3>
              <p className="text-yellow-800 dark:text-yellow-200">
                Não há eventos no banco de dados. Clique no botão acima para criar um novo evento!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Gerenciar Eventos</h1>
          <p className="text-muted-foreground mt-2">Crie e edite os eventos</p>
        </div>
        {!isEditing && (
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCreateNew} disabled={isLoading}>
              + Adicionar Evento
            </Button>
            <Button variant="gold" onClick={() => setIsEditing(true)} disabled={isLoading}>
              Editar Evento
            </Button>
          </div>
        )}
      </div>

      {/* Event Form or Display */}
      {isEditing ? (
        <div className="bg-card border border-border rounded-2xl p-8">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
            {isCreating ? 'Criar Novo Evento' : 'Editar Próximo Evento'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Image Upload Section */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground">Imagem do Estabelecimento</label>
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1 relative">
                  <img
                    src={previewLoadError ? PLACEHOLDER_IMAGE : imagePreview}
                    alt="Event preview"
                    className="w-full h-64 object-cover rounded-lg border border-border"
                    onError={handlePreviewLoadError}
                  />
                  {previewLoadError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                      <div className="text-center text-white">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">Erro ao carregar imagem</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="md:w-64 flex flex-col justify-center">
                  <label className="flex items-center justify-center w-full h-32 px-4 py-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-gold transition-colors bg-muted/30">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium text-foreground">Carregar imagem</span>
                      <span className="text-xs text-muted-foreground">PNG, JPG até 5MB</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Event Details Grid */}
            <div className="grid md:grid-cols-2 gap-6 border-t border-border pt-8">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Título do Evento</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Nome do estabelecimento"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Local</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Nome do local"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* City */}
              <div className="relative">
                <label className="block text-sm font-medium text-foreground mb-2">Cidade</label>
                <div className="relative">
                  <input
                    type="text"
                    name="city"
                    value={citySearchInput || formData.city}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        city: e.target.value,
                      }));
                      handleCitySearch(e.target.value);
                    }}
                    onFocus={() => citySearchInput.length >= 2 && setShowCitySuggestions(true)}
                    placeholder="Digite o nome da cidade"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                  />
                  {showCitySuggestions && cities.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {cities.slice(0, 10).map((city) => (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => handleCitySelect(city.nome)}
                          className="w-full text-left px-4 py-2 hover:bg-muted/50 focus:bg-muted/50 outline-none transition-colors border-b border-border last:border-b-0"
                        >
                          {city.nome}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Data (frequência)</label>
                <input
                  type="text"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  placeholder="Ex: Sábados com eventos regulares"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* Next Date */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Próxima Data</label>
                <input
                  type="date"
                  name="nextDate"
                  value={formatDate(formData.nextDate)}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      nextDate: e.target.value,
                    }));
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* Schedule */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Horário</label>
                <input
                  type="time"
                  name="schedule"
                  value={formatTime(formData.schedule)}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      schedule: e.target.value,
                    }));
                  }}
                  placeholder="19:00"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* Check-in */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Check-in</label>
                <input
                  type="text"
                  name="checkIn"
                  value={formData.checkIn}
                  onChange={handleInputChange}
                  placeholder="15-30 min antes"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* Environment */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Ambiente</label>
                <input
                  type="text"
                  name="environment"
                  value={formData.environment}
                  onChange={handleInputChange}
                  placeholder="Descrição do ambiente"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* Music */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Música</label>
                <input
                  type="text"
                  name="music"
                  value={formData.music}
                  onChange={handleInputChange}
                  placeholder="Música ao vivo a partir das 19h"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* Dress Code */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Dress Code</label>
                <input
                  type="text"
                  name="dressCode"
                  value={formData.dressCode}
                  onChange={handleInputChange}
                  placeholder="Esporte Fino / Casual Elegante"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* Parking */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Estacionamento</label>
                <input
                  type="text"
                  name="parking"
                  value={formData.parking}
                  onChange={handleInputChange}
                  placeholder="Zona Azul gratuita a partir das 13h (aos sábados)"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Preço</label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={(e) => {
                    const formatted = formatPrice(e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      price: formatted || e.target.value,
                    }));
                  }}
                  placeholder="R$ 40,00"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* Vagas */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Vagas</label>
                <input
                  type="number"
                  name="vagas"
                  value={formData.vagas}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* Vagas Limit Date */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Data Limite de Vagas</label>
                <input
                  type="date"
                  name="vagasLimitDate"
                  value={formatDate(formData.vagasLimitDate)}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      vagasLimitDate: e.target.value,
                    }));
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contato@flashdate.com.br"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">WhatsApp</label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => {
                    const formatted = formatWhatsApp(e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      whatsapp: formatted || e.target.value,
                    }));
                  }}
                  placeholder="(11) 97032-9710"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Descrição</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descrição do evento"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300 resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-end border-t border-border pt-8">
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                Cancelar
              </Button>
              <Button variant="gold" type="submit" disabled={isLoading}>
                {isLoading ? 'Processando...' : isCreating ? 'Criar Evento' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative">
            <img
              src={imageLoadError ? PLACEHOLDER_IMAGE : eventData.eventImage}
              alt={eventData.title}
              className="w-full h-96 object-cover rounded-2xl border border-border"
              onError={handleImageLoadError}
            />
            {imageLoadError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
                <div className="text-center text-white">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">Erro ao carregar imagem</p>
                  <p className="text-xs mt-1">Carregue uma nova imagem para continuar</p>
                </div>
              </div>
            )}
          </div>

          {/* Event Info */}
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-3xl font-bold text-foreground">{eventData.title}</h2>
              <p className="text-muted-foreground mt-2">{eventData.description}</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <InfoItem label="Local" value={eventData.location} />
              <InfoItem label="Cidade" value={eventData.city} />
              <InfoItem label="Data" value={eventData.date} />
              <InfoItem label="Próxima Data" value={eventData.nextDate} />
              <InfoItem label="Horário" value={eventData.schedule} />
              <InfoItem label="Check-in" value={eventData.checkIn} />
              <InfoItem label="Ambiente" value={eventData.environment} />
              <InfoItem label="Música" value={eventData.music} />
              <InfoItem label="Dress Code" value={eventData.dressCode} />
              <InfoItem label="Estacionamento" value={eventData.parking} />
              <InfoItem label="Preço" value={eventData.price} />
              <InfoItem label="Email" value={eventData.email} />
              <InfoItem label="WhatsApp" value={eventData.whatsapp} />
              <InfoItem label="Vagas" value={eventData.vagas} />
              <InfoItem label="Limite de Vagas" value={eventData.vagasLimitDate} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2">
      <span className="font-medium text-foreground">{label}:</span>
      <span className="text-muted-foreground text-right">{value}</span>
    </div>
  );
}
