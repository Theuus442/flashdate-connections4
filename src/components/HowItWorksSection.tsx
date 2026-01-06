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
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background/50 to-transparent" />
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

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold/50 via-wine/50 to-gold/50" />

          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`lg:flex items-center gap-8 ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Content Card */}
                <div className={`lg:w-5/12 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                  <div className="bg-card-gradient rounded-2xl p-8 border border-border hover:border-gold/30 transition-all duration-500 shadow-elegant">
                    <div className={`flex items-center gap-4 mb-4 ${index % 2 === 0 ? 'lg:justify-end' : ''}`}>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-wine to-wine-dark flex items-center justify-center">
                        <step.icon className="w-6 h-6 text-gold" />
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-foreground">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground mb-4">{step.description}</p>
                    {step.details.length > 0 && (
                      <ul className={`space-y-2 ${index % 2 === 0 ? 'lg:text-right' : ''}`}>
                        {step.details.map((detail, i) => (
                          <li key={i} className="text-sm text-foreground/70 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Step Number */}
                <div className="hidden lg:flex lg:w-2/12 justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-gold-glow">
                    <span className="font-serif text-xl font-bold text-background">{step.number}</span>
                  </div>
                </div>

                {/* Spacer */}
                <div className="hidden lg:block lg:w-5/12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
