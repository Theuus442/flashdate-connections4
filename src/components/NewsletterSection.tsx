import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';

const cities = [
  { id: 'sao-paulo', name: 'São Paulo' },
  { id: 'santo-andre', name: 'Santo André' },
  { id: 'sao-bernardo', name: 'São Bernardo' },
  { id: 'sao-caetano', name: 'São Caetano' },
];

export const NewsletterSection = () => {
  const [selectedCity, setSelectedCity] = useState('sao-paulo');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const city = cities.find(c => c.id === selectedCity);
    toast.success(`Obrigado! Você receberá novidades de eventos em ${city?.name}.`);
    setEmail('');
    setName('');
  };

  return (
    <section id="contato" className="h-full bg-elegant-gradient relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-gold text-sm font-medium tracking-widest uppercase mb-4">
            Fique Por Dentro
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Receba <span className="text-gradient-gold">Novidades</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Cadastre-se para receber informações sobre eventos na sua cidade
          </p>
        </div>

        {/* City Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => setSelectedCity(city.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                selectedCity === city.id
                  ? 'bg-gradient-to-r from-gold to-gold-dark text-background shadow-gold-glow'
                  : 'bg-card border border-border text-foreground hover:border-gold/50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              {city.name}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 border border-border shadow-elegant">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nome</label>
                <Input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">E-mail</label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="gold" size="lg" className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Quero Receber Novidades de {cities.find(c => c.id === selectedCity)?.name}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
