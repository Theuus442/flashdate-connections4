import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Phone, Mail, Search } from 'lucide-react';
import { toast } from 'sonner';
import { sendLGBTSignupEmail } from '@/lib/email.service';

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
