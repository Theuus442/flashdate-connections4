import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqData = [
  {
    category: 'Sobre o Evento',
    questions: [
      { q: 'O que é o Flashdate?', a: 'O Flashdate é uma plataforma de encontros presenciais que utiliza inteligência artificial para identificar matches com maior potencial de compatibilidade. Realizamos eventos de speed dating elegantes e seguros.' },
      { q: 'Como funciona a dinâmica do evento?', a: 'Durante o evento, as mulheres permanecem fixas em suas mesas enquanto os homens rotacionam a cada 5-10 minutos ao sinal do sino. Você terá tempo para conhecer cada participante brevemente.' },
      { q: 'Qual é a duração do evento?', a: 'O evento principal dura aproximadamente 2 horas. Recomendamos chegar 15-30 minutos antes para o check-in.' },
      { q: 'Quantas pessoas participam de cada evento?', a: 'Cada evento é cuidadosamente balanceado para garantir que todos tenham oportunidades iguais. O número exato varia, mas mantemos equilíbrio entre gêneros.' },
      { q: 'Posso participar sozinho(a)?', a: 'Sim! Na verdade, a maioria dos participantes vem sozinha. Nosso ambiente é acolhedor e projetado para facilitar novas conexões.' },
    ]
  },
  {
    category: 'Inscrição e Pagamento',
    questions: [
      { q: 'Como me inscrevo no evento?', a: 'Após adquirir o ingresso via Pix (11 97032 9710), envie para contato@flashdate.com.br: comprovante, data de nascimento, sexo, e-mail, celular com DDD e data do evento escolhido.' },
      { q: 'Qual o valor do ingresso?', a: 'O valor promocional é de R$ 40,00, pagamento via Pix. Este valor não é reembolsável.' },
      { q: 'O ingresso é reembolsável?', a: 'Não, o ingresso não é reembolsável. Porém, você pode transferir para outra pessoa do mesmo sexo até 5 dias antes do evento.' },
      { q: 'Posso transferir meu ingresso?', a: 'Sim, você pode transferir seu ingresso para outra pessoa do mesmo sexo até 5 dias antes do evento. Entre em contato conosco para realizar a transferência.' },
      { q: 'O que acontece se eu não puder comparecer?', a: 'Se não puder comparecer, você pode transferir o ingresso até 5 dias antes. Após esse prazo, infelizmente não será possível reembolso ou transferência.' },
    ]
  },
  {
    category: 'Inteligência Artificial',
    questions: [
      { q: 'Como a IA funciona no Flashdate?', a: 'Após sua inscrição, você receberá um questionário de 15 perguntas. Nossa IA analisa suas respostas para identificar compatibilidades com outros participantes, aumentando suas chances de match.' },
      { q: 'O questionário é obrigatório?', a: 'Sim, o questionário é parte fundamental da experiência. Ele permite que nossa IA faça análises mais precisas de compatibilidade.' },
      { q: 'Meus dados são seguros?', a: 'Absolutamente. Tratamos seus dados com total confidencialidade e seguimos as melhores práticas de segurança. Suas informações nunca são compartilhadas com terceiros.' },
      { q: 'A IA influencia quem eu encontro no evento?', a: 'A IA ajuda a identificar compatibilidades, mas você terá a oportunidade de conhecer todos os participantes durante o evento.' },
    ]
  },
  {
    category: 'Durante o Evento',
    questions: [
      { q: 'Qual dress code devo seguir?', a: 'O dress code é Esporte Fino / Casual Elegante. São proibidos: roupas de academia, chinelos, regatas, bonés e bermudas.' },
      { q: 'Como faço para indicar meu interesse?', a: 'Durante o evento, você usará nosso aplicativo para selecionar seus parceiros preferidos com SIM, TALVEZ ou NÃO.' },
      { q: 'Preciso baixar algum aplicativo?', a: 'Sim, instruções sobre o aplicativo serão enviadas antes do evento. É simples e intuitivo de usar.' },
      { q: 'E se eu sentir timidez ou nervosismo?', a: 'É completamente normal! Nosso ambiente é projetado para ser acolhedor. Nossa equipe está preparada para ajudar você a se sentir confortável.' },
      { q: 'Haverá bebidas ou comidas disponíveis?', a: 'Sim, o local oferece opções de bebidas e petiscos (não inclusos no ingresso). Após as 19h, música ao vivo cria o ambiente perfeito.' },
    ]
  },
  {
    category: 'Matches e Resultados',
    questions: [
      { q: 'Quando recebo os resultados?', a: 'Os resultados são enviados por e-mail em até 24 horas após o evento.' },
      { q: 'Como funciona o sistema de match?', a: 'SIM + SIM = Match (contatos trocados). SIM + TALVEZ ou TALVEZ + SIM = Amizade (contatos trocados). Qualquer NÃO = Nenhum contato.' },
      { q: 'E se eu não tiver nenhum match?', a: 'Isso pode acontecer. Cada evento é uma nova oportunidade. Continue participando e você encontrará suas conexões.' },
      { q: 'Os contatos são trocados automaticamente?', a: 'Sim, quando há match mútuo (SIM-SIM ou combinações com TALVEZ), os contatos são liberados automaticamente por e-mail.' },
      { q: 'Posso participar de vários eventos?', a: 'Claro! Muitos participantes frequentam regularmente. Cada evento traz novas pessoas e oportunidades.' },
    ]
  },
  {
    category: 'LGBT+ e Inclusão',
    questions: [
      { q: 'Vocês realizam eventos LGBT+?', a: 'Sim! Aproximadamente 12% da população é LGBT+ e nossa missão é unir casais independente do sexo ou orientação.' },
      { q: 'Como me cadastro para eventos LGBT+?', a: 'Preencha o formulário específico em nosso site informando sua identidade de gênero, orientação sexual e preferências.' },
      { q: 'Os eventos LGBT+ são separados?', a: 'Sim, realizamos eventos específicos para garantir que todos os participantes tenham a melhor experiência possível.' },
      { q: 'Posso participar de eventos de diferentes categorias?', a: 'Os eventos são organizados por públicos específicos para maximizar as chances de match. Entre em contato para entender as opções.' },
    ]
  },
  {
    category: 'Segurança e Privacidade',
    questions: [
      { q: 'O evento é seguro?', a: 'Absolutamente. Todos os participantes são verificados durante a inscrição. Nossos eventos acontecem em locais seguros e controlados.' },
      { q: 'Vocês verificam a identidade dos participantes?', a: 'Sim, solicitamos documentos durante a inscrição para garantir a autenticidade de todos os participantes.' },
      { q: 'Minha escolha de NÃO é confidencial?', a: 'Totalmente. Ninguém sabe quem você rejeitou. Apenas matches positivos geram troca de contatos.' },
      { q: 'Posso bloquear alguém após o evento?', a: 'Se tiver qualquer problema com algum participante após o evento, entre em contato conosco imediatamente.' },
      { q: 'Há equipe de suporte durante o evento?', a: 'Sim, nossa equipe está presente durante todo o evento para garantir que tudo ocorra perfeitamente.' },
    ]
  },
];

export const FAQSection = () => {
  return (
    <section id="faq" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-wine/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-gold text-sm font-medium tracking-widest uppercase mb-4">
            Tire Suas Dúvidas
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Central de <span className="text-gradient-gold">Dúvidas</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Encontre respostas para as perguntas mais frequentes sobre o Flashdate
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto space-y-8">
          {faqData.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3 className="font-serif text-xl font-bold text-gold mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-sm">
                  {categoryIndex + 1}
                </span>
                {category.category}
              </h3>
              <Accordion type="single" collapsible className="space-y-2">
                {category.questions.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`${categoryIndex}-${index}`}
                    className="bg-card rounded-xl border border-border px-6 data-[state=open]:border-gold/30 transition-colors"
                  >
                    <AccordionTrigger className="text-left font-medium text-foreground hover:text-gold py-5">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
