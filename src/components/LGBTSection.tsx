import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Send } from 'lucide-react';
import { toast } from 'sonner';
import lgbtLogo from '@/assets/Gemini_Generated_Image_667hnk667hnk667h.png';

export const LGBTSection = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    identidadeGenero: '',
    orientacao: '',
    generoBusca: '',
    localizacao: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Formulário enviado com sucesso! Entraremos em contato em breve.');
    setFormData({
      nome: '',
      email: '',
      whatsapp: '',
      identidadeGenero: '',
      orientacao: '',
      generoBusca: '',
      localizacao: '',
    });
  };

  return (
    <section id="lgbtq" className="py-24 bg-elegant-gradient relative overflow-hidden">
      {/* Rainbow Gradient Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500" />
      
      <div className="absolute -top-40 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-sm font-medium tracking-widest uppercase mb-4">
              <span className="text-2xl">🏳️‍🌈</span>
              <span className="bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Comunidade LGBT+
              </span>
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
              Amor Sem <span className="text-gradient-gold">Fronteiras</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              Aproximadamente 12% da população é LGBT+. A missão da nossa IA é unir casais 
              independente do sexo ou orientação. Acreditamos no amor em todas as suas formas.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-3xl border border-border p-8 md:p-12 shadow-elegant">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-foreground">Cadastre-se</h3>
                <p className="text-sm text-muted-foreground">Encontre sua conexão especial</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Nome Completo</label>
                  <Input
                    type="text"
                    placeholder="Seu nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">E-mail</label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">WhatsApp</label>
                  <Input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Localização</label>
                  <Input
                    type="text"
                    placeholder="Cidade / Região"
                    value={formData.localizacao}
                    onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Identidade de Gênero</label>
                  <Select
                    value={formData.identidadeGenero}
                    onValueChange={(value) => setFormData({ ...formData, identidadeGenero: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="trans">Trans</SelectItem>
                      <SelectItem value="nao-binario">Não-Binário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Orientação Sexual</label>
                  <Select
                    value={formData.orientacao}
                    onValueChange={(value) => setFormData({ ...formData, orientacao: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gay">Gay</SelectItem>
                      <SelectItem value="lesbica">Lésbica</SelectItem>
                      <SelectItem value="bissexual">Bissexual</SelectItem>
                      <SelectItem value="pansexual">Pansexual</SelectItem>
                      <SelectItem value="assexual">Assexual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Gênero que Busca</label>
                  <Select
                    value={formData.generoBusca}
                    onValueChange={(value) => setFormData({ ...formData, generoBusca: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="trans">Trans</SelectItem>
                      <SelectItem value="nao-binario">Não-Binário</SelectItem>
                      <SelectItem value="qualquer">Qualquer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" variant="gold" size="lg" className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Enviar Cadastro
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
