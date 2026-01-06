import { Briefcase, Heart, Target, Users } from 'lucide-react';

const characteristics = [
  {
    icon: Users,
    title: 'Público Maduro',
    description: 'Faixa etária entre 30 e 50 anos, com maturidade emocional para relacionamentos sérios.',
  },
  {
    icon: Briefcase,
    title: 'Estabilidade Profissional',
    description: 'Profissionais estabelecidos que buscam equilíbrio entre carreira e vida pessoal.',
  },
  {
    icon: Target,
    title: 'Intenções Claras',
    description: 'Pessoas que sabem o que querem e buscam conexões genuínas e duradouras.',
  },
  {
    icon: Heart,
    title: 'Busca por Conexão Real',
    description: 'Cansados de apps superficiais, procuram encontros presenciais e autênticos.',
  },
];

export const WhoAttendsSection = () => {
  return (
    <section className="min-h-full bg-background relative flex flex-col">
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-wine/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-gold text-sm font-medium tracking-widest uppercase mb-4">
            Nosso Público
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Quem <span className="text-gradient-gold">Frequenta</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Selecionamos cuidadosamente participantes que compartilham valores e objetivos semelhantes
          </p>
        </div>

        {/* Characteristics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {characteristics.map((item, index) => (
            <div
              key={index}
              className="bg-card-gradient rounded-2xl p-8 border border-border hover:border-gold/30 transition-all duration-500 shadow-elegant group text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-wine to-wine-dark flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <item.icon className="w-8 h-8 text-gold" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-3">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
