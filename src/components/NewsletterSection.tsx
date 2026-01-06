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
    <section id="contato" className="min-h-full bg-background relative flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/5 via-muted/5 to-transparent" />

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
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg shadow-yellow-500/30'
                  : 'bg-card border border-border text-foreground hover:border-secondary/50'
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
              <Button type="submit" variant="hero" size="lg" className="w-full h-auto flex-wrap gap-2">
                <Send className="w-4 h-4 flex-shrink-0" />
                <span>Quero Receber Novidades de {cities.find(c => c.id === selectedCity)?.name}</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
