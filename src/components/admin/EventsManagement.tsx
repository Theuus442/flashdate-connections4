import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { eventsService, EventData } from '@/lib/events.service';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

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
  eventImage: 'https://images.unsplash.com/photo-1519167758481-dc80e6f0b6da?w=600&h=400',
  email: 'contato@flashdate.com.br',
  whatsapp: '(11) 97032-9710',
  vagas: '1',
  vagasLimitDate: '25/01/2026',
};

export const EventsManagement = () => {
  const { toast } = useToast();
  const supabaseConfigured = isSupabaseConfigured();
  const [eventData, setEventData] = useState<EventData>(defaultEventData);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EventData>(eventData);
  const [imagePreview, setImagePreview] = useState(eventData.eventImage);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // Load event from Supabase on mount
  useEffect(() => {
    const loadEvent = async () => {
      if (!supabaseConfigured) {
        return;
      }

      setIsLoading(true);
      try {
        const events = await eventsService.getEvents();
        if (events.data && events.data.length > 0) {
          // Get the first event (or latest)
          const event = events.data[0];
          setEventData(event);
          setFormData(event);
          setImagePreview(event.eventImage);
        }
      } catch (error) {
        console.error('Error loading event:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [supabaseConfigured]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setImagePreview(imageUrl);
        setFormData(prev => ({
          ...prev,
          eventImage: imageUrl,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEventData(formData);
    setIsEditing(false);
    alert('Evento atualizado com sucesso!');
  };

  const handleCancel = () => {
    setFormData(eventData);
    setImagePreview(eventData.eventImage);
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Gerenciar Eventos</h1>
          <p className="text-muted-foreground mt-2">Edite as informações do próximo evento</p>
        </div>
        {!isEditing && (
          <Button variant="gold" onClick={() => setIsEditing(true)}>
            Editar Evento
          </Button>
        )}
      </div>

      {/* Event Form or Display */}
      {isEditing ? (
        <div className="bg-card border border-border rounded-2xl p-8">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Editar Próximo Evento</h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Image Upload Section */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground">Imagem do Estabelecimento</label>
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    className="w-full h-64 object-cover rounded-lg border border-border"
                  />
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
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Cidade</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Cidade, Estado"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
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
                  type="text"
                  name="nextDate"
                  value={formData.nextDate}
                  onChange={handleInputChange}
                  placeholder="DD/MM/AAAA"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* Schedule */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Horário</label>
                <input
                  type="text"
                  name="schedule"
                  value={formData.schedule}
                  onChange={handleInputChange}
                  placeholder="Conforme agendado"
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
                  onChange={handleInputChange}
                  placeholder="R$ 40,00"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* Vagas */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Vagas</label>
                <input
                  type="text"
                  name="vagas"
                  value={formData.vagas}
                  onChange={handleInputChange}
                  placeholder="(1)"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all duration-300"
                />
              </div>

              {/* Vagas Limit Date */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Data Limite de Vagas</label>
                <input
                  type="text"
                  name="vagasLimitDate"
                  value={formData.vagasLimitDate}
                  onChange={handleInputChange}
                  placeholder="DD/MM/AAAA"
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
                  onChange={handleInputChange}
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
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button variant="gold" type="submit">
                Salvar Alterações
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div>
            <img
              src={eventData.eventImage}
              alt={eventData.title}
              className="w-full h-96 object-cover rounded-2xl border border-border"
            />
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
