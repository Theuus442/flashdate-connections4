import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

const estados = [
  { value: 'sp', label: 'São Paulo' },
  { value: 'mg', label: 'Minas Gerais' },
  { value: 'rj', label: 'Rio de Janeiro' },
  { value: 'ba', label: 'Bahia' },
  { value: 'rs', label: 'Rio Grande do Sul' },
  { value: 'sc', label: 'Santa Catarina' },
  { value: 'pr', label: 'Paraná' },
  { value: 'pe', label: 'Pernambuco' },
  { value: 'ce', label: 'Ceará' },
  { value: 'df', label: 'Distrito Federal' },
];

const cidades: { [key: string]: string[] } = {
  sp: ['São Paulo', 'Santo André', 'São Bernardo', 'São Caetano'],
  mg: ['Belo Horizonte', 'Contagem', 'Betim'],
  rj: ['Rio de Janeiro', 'Niterói', 'Duque de Caxias'],
  ba: ['Salvador', 'Feira de Santana', 'Vitória da Conquista'],
  rs: ['Porto Alegre', 'Caxias do Sul', 'Novo Hamburgo'],
  sc: ['Florianópolis', 'Joinville', 'Blumenau'],
  pr: ['Curitiba', 'Londrina', 'Maringá'],
  pe: ['Recife', 'Jaboatão', 'Olinda'],
  ce: ['Fortaleza', 'Juazeiro', 'Maracanaú'],
  df: ['Brasília'],
};

export const LGBTSection = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    identidadeGenero: [] as string[],
    orientacao: '',
    generoBusca: [] as string[],
    estado: '',
    cidade: '',
  });

  const [cidadesDisponiveis, setCidadesDisponiveis] = useState<string[]>([]);

  const handleEstadoChange = (estado: string) => {
    setFormData({ ...formData, estado, cidade: '' });
    setCidadesDisponiveis(cidades[estado] || []);
  };

  const toggleCheckbox = (field: 'identidadeGenero' | 'generoBusca', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.estado || !formData.cidade) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (formData.identidadeGenero.length === 0) {
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

    toast.success('Cadastro realizado com sucesso! Entraremos em contato em breve.');
    setFormData({
      nome: '',
      email: '',
      whatsapp: '',
      identidadeGenero: [],
      orientacao: '',
      generoBusca: [],
      estado: '',
      cidade: '',
    });
    setCidadesDisponiveis([]);
  };

  return (
    <section id="lgbtq" className="py-24 bg-elegant-gradient relative overflow-hidden">
      {/* Rainbow Gradient Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500" />
      
      <div className="absolute -top-40 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="mb-6 flex justify-center">
              <img 
                src="https://cdn.builder.io/api/v1/image/assets%2F1eb056757fdd408fb16c0434aacb3dcd%2F101ed4d62d404da0b1e5ee70eb7980b7?format=webp&width=800"
                alt="LGBT+ Pride"
                className="h-24 w-auto"
              />
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-medium tracking-widest uppercase mb-4">
              <span className="text-2xl">🏳️‍🌈</span>
              <span className="bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
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
                    <label className="block text-sm font-medium text-foreground mb-2">WhatsApp <span className="text-xs text-muted-foreground">(opcional)</span></label>
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
                      <Checkbox
                        checked={formData.identidadeGenero.includes(option.value)}
                        onCheckedChange={() => toggleCheckbox('identidadeGenero', option.value)}
                      />
                      <span className="text-sm text-foreground">{option.label}</span>
                    </label>
                  ))}
                </div>
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
                    <label className="block text-sm font-medium text-foreground mb-2">Estado</label>
                    <Select value={formData.estado} onValueChange={handleEstadoChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map((estado) => (
                          <SelectItem key={estado.value} value={estado.value}>
                            {estado.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Cidade</label>
                    <Select value={formData.cidade} onValueChange={(value) => setFormData({ ...formData, cidade: value })}>
                      <SelectTrigger disabled={!formData.estado}>
                        <SelectValue placeholder={formData.estado ? "Selecione a cidade" : "Selecione um estado primeiro"} />
                      </SelectTrigger>
                      <SelectContent>
                        {cidadesDisponiveis.map((cidade) => (
                          <SelectItem key={cidade} value={cidade}>
                            {cidade}
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
                  <a href="https://wa.me/5511970329710" className="text-foreground font-semibold hover:text-gold transition-colors">
                    (11) 97032-9710
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
