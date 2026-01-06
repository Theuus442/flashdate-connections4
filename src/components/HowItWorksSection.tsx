import { UserPlus, Brain, CalendarCheck, Smartphone, Mail, Check, X } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Inscrição',
    description: 'Adquira o ingresso. Após a compra, envie para o e-mail contato@flashdate.com.br:',
    details: ['Comprovante de pagamento', 'Data de Nascimento', 'Sexo', 'E-mail de contato', 'Celular com DDD', 'Data do Evento desejado'],
  },
  {
    number: '02',
    icon: Brain,
    title: 'Análise de IA',
    description: 'Você receberá um questionário simples de 15 perguntas por e-mail. Nossa IA utilizará seus dados para entender melhor seu perfil e encontrar o match mais compatível.',
    details: [],
  },
  {
    number: '03',
    icon: CalendarCheck,
    title: 'O Evento',
    description: 'Compareça com 15 a 30 minutos de antecedência para o check-in. As mulheres ficam fixas nas mesas enquanto os homens rotacionam.',
    details: ['Conversas de 5 a 10 minutos por mesa', 'Sinal do sino indica rotação', 'Duração total: ~2 horas', 'Após evento: aproveite para comer, beber e conversar livremente'],
  },
  {
    number: '04',
    icon: Smartphone,
    title: 'Seleção Digital',
    description: 'No dia do evento, você fará login no nosso app para selecionar seus parceiros preferidos. É importante selecionar todos e enviar sua seleção.',
    details: ['Opções: SIM, TALVEZ ou NÃO', 'A seleção determina os matches', 'Ambos devem selecionar SIM para match confirmado'],
  },
  {
    number: '05',
    icon: Mail,
    title: 'Resultados',
    description: 'Você recebe o resultado via e-mail em até 24 horas com seus matches confirmados e contatos trocados.',
    details: ['Contatos apenas se ambos optarem por SIM ou TALVEZ', 'Possibilidade de amizade e outras conexões'],
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
