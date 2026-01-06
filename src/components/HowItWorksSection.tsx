import { UserPlus, Brain, CalendarCheck, Smartphone, Mail } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Inscrição',
    description: 'Adquira o ingresso. Após a compra, envie para o e-mail contato@flashdate.com.br:',
    details: ['Comprovante de pagamento', 'Data de Nascimento', 'Sexo', 'E-mail', 'Celular com DDD', 'Data do Evento escolhido'],
  },
  {
    number: '02',
    icon: Brain,
    title: 'Análise de IA',
    description: 'Você receberá um questionário de 15 perguntas por e-mail. Nossa IA processará seu perfil para encontrar a maior compatibilidade.',
    details: [],
  },
  {
    number: '03',
    icon: CalendarCheck,
    title: 'O Evento',
    description: 'Check-in 15-30 minutos antes do início.',
    details: ['Mulheres fixas nas mesas', 'Homens rotacionam a cada 5-10 minutos', 'Ao sinal do sino, a rotação acontece'],
  },
  {
    number: '04',
    icon: Smartphone,
    title: 'Seleção Digital',
    description: 'Durante o evento, você usará nosso app para selecionar seus parceiros preferidos.',
    details: [],
  },
  {
    number: '05',
    icon: Mail,
    title: 'Resultados',
    description: 'Em até 24 horas, você recebe o resultado via e-mail com seus matches confirmados.',
    details: [],
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-24 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-wine/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-gold text-sm font-medium tracking-widest uppercase mb-4">
            Passo a Passo
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Como <span className="text-gradient-gold">Funciona</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Um processo simples e elegante para encontrar sua conexão perfeita
          </p>
        </div>

        {/* Steps Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {steps.slice(0, 3).map((step, index) => (
              <div
                key={step.number}
                className="group relative bg-card rounded-2xl p-8 border border-border hover:border-gold/40 transition-all duration-500 shadow-elegant"
              >
                {/* Step Number Badge */}
                <div className="absolute -top-4 left-8 w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-gold-glow">
                  <span className="font-serif text-sm font-bold text-background">{step.number}</span>
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-wine to-wine-dark flex items-center justify-center mb-6 mt-2 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-7 h-7 text-gold" />
                </div>

                {/* Content */}
                <h3 className="font-serif text-xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{step.description}</p>
                
                {step.details.length > 0 && (
                  <ul className="space-y-2">
                    {step.details.map((detail, i) => (
                      <li key={i} className="text-sm text-foreground/70 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0 mt-1.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Bottom row centered */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {steps.slice(3).map((step) => (
              <div
                key={step.number}
                className="group relative bg-card rounded-2xl p-8 border border-border hover:border-gold/40 transition-all duration-500 shadow-elegant"
              >
                {/* Step Number Badge */}
                <div className="absolute -top-4 left-8 w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-gold-glow">
                  <span className="font-serif text-sm font-bold text-background">{step.number}</span>
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-wine to-wine-dark flex items-center justify-center mb-6 mt-2 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-7 h-7 text-gold" />
                </div>

                {/* Content */}
                <h3 className="font-serif text-xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
