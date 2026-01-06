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

        {/* Introduction */}
        <div className="bg-card/50 border border-border/30 rounded-2xl p-8 md:p-12 mb-16 backdrop-blur-sm">
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            <span className="text-gold font-semibold">Flashdate</span> é a plataforma pioneira de encontros presenciais que utiliza Inteligência Artificial para identificar o seu match com maior potencial. Com o Flashdate, você otimiza suas chances de encontrar um(a) parceiro(a) compatível, aumentando significativamente as perspectivas de um relacionamento agradável e duradouro.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Acreditamos que há alguém procurando exatamente por você. Nosso processo usa tecnologia avançada para conectar pessoas com verdaeiro potencial de compatibilidade.
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
                {step.details.length > 0 && (
                  <ul className="mt-4 space-y-2">
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
        </div>

        {/* Match Logic Table */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Lógica de <span className="text-gradient-gold">Matches</span>
            </h3>
            <p className="text-muted-foreground">Como são determinados seus resultados após o evento</p>
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-elegant">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-wine/20 border-b border-border">
                    <th className="px-4 md:px-6 py-3 text-left text-sm font-semibold text-gold">Sua Escolha</th>
                    <th className="px-4 md:px-6 py-3 text-left text-sm font-semibold text-gold">Escolha da Outra Pessoa</th>
                    <th className="px-4 md:px-6 py-3 text-left text-sm font-semibold text-gold">Resultado</th>
                    <th className="px-4 md:px-6 py-3 text-left text-sm font-semibold text-gold">Contatos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-wine/5 transition-colors">
                    <td className="px-4 md:px-6 py-4 text-sm text-foreground"><span className="text-gold font-medium">SIM</span></td>
                    <td className="px-4 md:px-6 py-4 text-sm text-foreground"><span className="text-gold font-medium">SIM</span></td>
                    <td className="px-4 md:px-6 py-4 text-sm"><span className="text-gold font-bold flex items-center gap-2">Match <Check className="w-4 h-4" /></span></td>
                    <td className="px-4 md:px-6 py-4 text-sm text-foreground">Contatos Trocados</td>
                  </tr>
                  <tr className="hover:bg-wine/5 transition-colors">
                    <td className="px-4 md:px-6 py-4 text-sm text-foreground"><span className="text-gold font-medium">SIM</span></td>
                    <td className="px-4 md:px-6 py-4 text-sm text-foreground"><span className="text-muted-foreground font-medium">SIM ou TALVEZ</span></td>
                    <td className="px-4 md:px-6 py-4 text-sm"><span className="text-secondary font-semibold">Amizade</span></td>
                    <td className="px-4 md:px-6 py-4 text-sm text-foreground">Contatos Trocados</td>
                  </tr>
                  <tr className="hover:bg-wine/5 transition-colors">
                    <td className="px-4 md:px-6 py-4 text-sm text-foreground"><span className="text-muted-foreground font-medium">TALVEZ</span></td>
                    <td className="px-4 md:px-6 py-4 text-sm text-foreground"><span className="text-gold font-medium">SIM</span></td>
                    <td className="px-4 md:px-6 py-4 text-sm"><span className="text-secondary font-semibold">Amizade</span></td>
                    <td className="px-4 md:px-6 py-4 text-sm text-foreground">Contatos Trocados</td>
                  </tr>
                  <tr className="hover:bg-wine/5 transition-colors">
                    <td className="px-4 md:px-6 py-4 text-sm text-foreground"><span className="text-muted-foreground font-medium">NÃO</span></td>
                    <td className="px-4 md:px-6 py-4 text-sm text-foreground"><span className="text-gold font-medium">SIM / TALVEZ / NÃO</span></td>
                    <td className="px-4 md:px-6 py-4 text-sm"><span className="text-destructive font-semibold flex items-center gap-2">Nenhum <X className="w-4 h-4" /></span></td>
                    <td className="px-4 md:px-6 py-4 text-sm text-muted-foreground">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-foreground/5 border-t border-border">
              <p className="text-sm text-muted-foreground">
                <span className="text-gold font-semibold">Importante:</span> A outra pessoa só receberá seu contato se você optar por <span className="text-gold font-medium">SIM</span> ou <span className="text-gold font-medium">TALVEZ</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Event Details Section */}
        <div className="mt-20 grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Dress Code */}
          <div className="bg-card rounded-2xl p-8 border border-border shadow-elegant">
            <h4 className="font-serif text-2xl font-bold text-foreground mb-6">Traje Recomendado</h4>
            <p className="text-muted-foreground mb-4">Adote um visual que combine com:</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0 mt-2" />
                <span className="text-foreground">Esporte fino</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0 mt-2" />
                <span className="text-foreground">Casual elegante</span>
              </li>
            </ul>

            <div className="mt-8 pt-8 border-t border-border">
              <h5 className="font-semibold text-foreground mb-4">Evite:</h5>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  Roupas de academia
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  Itens esportivos
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  Camisetas de time
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  Chinelos, regatas, bonés
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  Bermudas
                </li>
              </ul>
              <p className="text-sm text-foreground/60 mt-4">Objetivo: manter um ambiente sofisticado</p>
            </div>
          </div>

          {/* Event Information */}
          <div className="bg-card rounded-2xl p-8 border border-border shadow-elegant">
            <h4 className="font-serif text-2xl font-bold text-foreground mb-6">Detalhes do Evento</h4>

            <div className="space-y-6">
              <div>
                <h5 className="text-gold font-semibold mb-2">Duração</h5>
                <p className="text-foreground">Aproximadamente 2 horas</p>
              </div>

              <div>
                <h5 className="text-gold font-semibold mb-2">Check-in</h5>
                <p className="text-foreground">15 a 30 minutos antes do início (preferencialmente)</p>
              </div>

              <div>
                <h5 className="text-gold font-semibold mb-2">Vagas Dinâmicas</h5>
                <p className="text-muted-foreground text-sm">O número de vagas é ajustado em tempo real conforme o fluxo de interessados e o equilíbrio entre os gêneros.</p>
              </div>

              <div>
                <h5 className="text-gold font-semibold mb-2">Após o Evento</h5>
                <p className="text-muted-foreground text-sm">Sinta-se à vontade para continuar no ambiente, comendo ou bebendo algo (consumo à parte) e conversando com quem desejar.</p>
              </div>

              <div className="pt-4 border-t border-border">
                <h5 className="text-gold font-semibold mb-2">Cancelamento/Reembolso</h5>
                <p className="text-foreground text-sm mb-2">Confirmamos o evento apenas ao atingir o mínimo de <span className="font-semibold">10 pares inscritos</span>.</p>
                <p className="text-muted-foreground text-sm">Se o limite não for alcançado, sua inscrição será totalmente reembolsada.</p>
                <p className="text-destructive text-sm mt-3 font-semibold">O valor pago não é reembolsável por desistência, mas pode ser transferido para outra pessoa.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Participant Profile Section */}
        <div className="mt-20 bg-gradient-to-r from-wine/10 to-gold/10 border border-border/30 rounded-2xl p-8 md:p-12 max-w-5xl mx-auto">
          <h3 className="font-serif text-3xl font-bold text-foreground mb-8">Quem Frequenta Nossos Eventos</h3>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Nossos encontros atraem predominantemente um público <span className="text-gold font-semibold">maduro</span>, com sólido background cultural e estabilidade profissional/financeira.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Este perfil de participante prioriza a busca por um <span className="text-gold font-semibold">vínculo amoroso duradouro</span>, tendo se distanciado da cena noturna agitada em busca de um formato de interação mais intencional e eficaz.
              </p>
            </div>

            <div>
              <div className="space-y-4">
                <div>
                  <h5 className="text-gold font-semibold mb-2">Faixa Etária Predominante</h5>
                  <p className="text-foreground">Aproximadamente 30 a 50 anos</p>
                </div>

                <div>
                  <h5 className="text-gold font-semibold mb-2">Inscrições Femininas</h5>
                  <p className="text-foreground">Tendem a esgotar rapidamente</p>
                </div>

                <div>
                  <h5 className="text-gold font-semibold mb-2">Homens</h5>
                  <p className="text-foreground">Demonstram resistência inicial, mas se engajam rapidamente após a primeira experiência, tornando-se participantes frequentes e influenciadores positivos.</p>
                </div>

                <div className="pt-4 border-t border-border/30">
                  <p className="text-sm text-gold font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Alto índice de sucesso e recomendações
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">Muitos namoros se formam a partir de nossos eventos!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
