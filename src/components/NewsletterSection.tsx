import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { toast } from 'sonner';

export const NewsletterSection = () => {
  const [formData, setFormData] = useState({
    assunto: '',
    nome: '',
    email: '',
    mensagem: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Obrigado! Sua mensagem foi enviada com sucesso.');
    setFormData({
      assunto: '',
      nome: '',
      email: '',
      mensagem: '',
    });
  };

  return (
    <section id="contato" className="min-h-full bg-background relative flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/5 via-muted/5 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-gold text-sm font-medium tracking-widest uppercase mb-4">
            Entre em Contato
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Dúvidas, Parcerias e <span className="text-gradient-gold">Informações</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Entre em contato conosco para qualquer dúvida, proposta de parceria ou informação adicional.
          </p>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 border border-border shadow-elegant">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Assunto</label>
                <Input
                  type="text"
                  name="assunto"
                  placeholder="Qual é o assunto da sua mensagem?"
                  value={formData.assunto}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nome</label>
                <Input
                  type="text"
                  name="nome"
                  placeholder="Seu nome completo"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">E-mail</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Mensagem</label>
                <Textarea
                  name="mensagem"
                  placeholder="Sua mensagem aqui..."
                  value={formData.mensagem}
                  onChange={handleChange}
                  required
                  className="min-h-32"
                />
              </div>
              <Button type="submit" variant="hero" className="w-full text-xs sm:text-sm h-10 sm:h-12 px-3 sm:px-8 gap-1 sm:gap-2 flex-wrap">
                <Send className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Enviar Mensagem</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
