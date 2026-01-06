import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqData = [
  {
    category: 'Como Funciona o Flashdate',
    questions: [
      { 
        q: 'Como funciona o modelo speed dating (Flashdate)?', 
        a: 'O Flash Date é um método otimizado de encontros, utilizando um evento presencial e estruturado onde a Inteligência Artificial (IA) cruza dados de compatibilidade fornecidos em pesquisas prévias para maximizar as chances de sucesso. O evento consiste em uma série de mini-encontros de 5 a 10 minutos, e os contatos são trocados somente entre aqueles que indicaram interesse mútuo (match).' 
      },
      { 
        q: 'Qual a diferença entre aplicativos de namoro comuns e o Flash Date?', 
        a: 'O Flashdate usa Inteligência Artificial (IA) rigorosa para gerar matchs de alta compatibilidade, focando em encontrar o parceiro perfeito no menor tempo. Já os aplicativos comuns usam o modelo Freemium (gratuito, com recursos pagos), priorizando apenas conexão visual e proximidade. Eles dependem da sua permanência na plataforma para vender recursos premium e publicidade, em vez de focar ativamente no match de alta qualidade.' 
      },
      { 
        q: 'Qual é a duração do evento?', 
        a: 'Os eventos de Speed Dating geralmente têm uma duração total aproximada de 2 horas. A duração total, no entanto, pode variar ligeiramente de acordo com o organizador e o número exato de pessoas presentes.' 
      },
      { 
        q: 'Quanto tempo dura cada encontro no speed dating?', 
        a: 'O formato do nosso evento de flashdate é dinâmico e otimizado por IA. O tempo de conversação varia entre 5 e 10 minutos, dependendo do nível de compatibilidade pré-avaliada entre os participantes. Alta e Média Compatibilidade: 10 minutos para maximizar as chances de conexão. Baixa Compatibilidade: 5 minutos. Compatibilidade Mínima/Nula: A IA pode optar por não agendar a interação, poupando o tempo dos participantes e focando nos encontros com maior potencial de sucesso.' 
      },
      { 
        q: 'Quantos encontros terei num evento Speed Dating?', 
        a: 'O número de encontros e com quem você conversará são definidos por Inteligência Artificial (IA), que determina o tempo de interação com base na compatibilidade. Os fatores que influenciam são: Número de Participantes (mínimo 10 homens e 10 mulheres) e Grau de Compatibilidade (definido por IA). Portanto, você não conversará necessariamente com todos os participantes do sexo oposto, mas sim com aqueles que a IA identificou como seus pares mais compatíveis.' 
      },
      { 
        q: 'O speed dating é eficaz?', 
        a: 'Sim, o Speed Dating é altamente eficaz e superior às alternativas. Diferente dos aplicativos, que visam o lucro e se baseiam na aparência, o Flashdate foca na compatibilidade e conexão real, usando IA para triagem e garantindo perfis com alto potencial de afinidade. Em baladas e bares, o alto ruído e a dificuldade de iniciar conversas atrapalham, além do risco de se aproximar de alguém já comprometido, gerando desconforto. No Flash Date, todos são solteiros verificados e prontos para conversar, permitindo que você conheça várias pessoas compatíveis em um ambiente tranquilo e seguro em uma única noite.' 
      },
      { 
        q: 'As pessoas realmente encontram relacionamentos sérios através do speed dating?', 
        a: 'Sim, todos os participantes buscam ativamente um parceiro sério. O uso de Inteligência Artificial (IA) garante que os matchs sejam gerados com base em compatibilidade avançada. Há muitos relatos e estudos que confirmam o sucesso da abordagem em formar casais duradouros.' 
      },
    ]
  },
  {
    category: 'Requisitos e Inscrição',
    questions: [
      { 
        q: 'Existe algum requisito para poder participar num evento Speed Dating?', 
        a: 'Sim, os requisitos são: 1) Status Civil: Ser solteiro(a), divorciado(a) ou viúvo(a). 2) Idade: Ter a idade estipulada para o evento (sendo tolerada uma idade um pouco acima ou abaixo). 3) Preenchimento da Pesquisa: Para que a IA funcione, é fundamental preencher a pesquisa de compatibilidade com sinceridade no ato da inscrição. 4) Inscrição: Pagar a taxa e se registrar no evento.' 
      },
      { 
        q: 'Como me inscrevo no evento?', 
        a: 'Após adquirir o ingresso via Pix (11 97032 9710), envie para contato@flashdate.com.br: comprovante, data de nascimento, sexo, e-mail, celular com DDD e data do evento escolhido.' 
      },
      { 
        q: 'Quanto custa participar num evento Speed Dating?', 
        a: 'O custo de participação varia consideravelmente, dependendo do evento, da cidade e dos itens inclusos no pacote. Os valores podem variar de R$ 30 (em eventos promocionais ou lotes iniciais) a R$ 120 ou mais (para eventos que incluem buffet, bebidas ou que são realizados em locais de alto padrão). É recomendável sempre verificar o preço e o que está incluso diretamente na página de inscrição do evento que você planeja participar.' 
      },
      { 
        q: 'O ingresso é reembolsável?', 
        a: 'Não, o ingresso não é reembolsável. Porém, você pode transferir para outra pessoa do mesmo sexo até 5 dias antes do evento.' 
      },
      { 
        q: 'E se eu precisar cancelar a minha participação, posso repassar meu ingresso para outra pessoa?', 
        a: 'Sim, a transferência do ingresso é permitida, mas com as seguintes condições: Prazo: É permitido realizar a transferência até 5 dias antes do evento. Requisito de Sexo: No caso de eventos de Speed Dating heterossexuais, a pessoa substituta deve ser do mesmo sexo que o participante original. Esta exigência é crucial para manter o equilíbrio entre o número de participantes masculinos e femininos. De qualquer forma, se precisar, entre em contato com o suporte via WhatsApp.' 
      },
    ]
  },
  {
    category: 'Segurança e Local do Evento',
    questions: [
      { 
        q: 'O local do evento é seguro?', 
        a: 'Sim, o local do evento é projetado para ser seguro e controlado, seguindo estas práticas: 1) Ambiente Neutro e Público: Os eventos geralmente ocorrem em locais de acesso público e bem movimentados (restaurantes, bares ou salões de eventos alugados), garantindo visibilidade e a presença de outras pessoas e funcionários. 2) Organização e Supervisão: A equipe organizadora do evento está presente para gerenciar o fluxo das rodadas, garantir o respeito às regras e atuar como um ponto de contato imediato caso haja qualquer desconforto. 3) Troca de Contatos Controlada: As informações de contato nunca são trocadas diretamente durante os mini-encontros. A troca só ocorre após o evento, de forma privada e segura, apenas se houver match mútuo. 4) Cadastro Prévio: Embora não seja uma garantia total, o cadastro prévio com dados fornecidos à organização aumenta a responsabilidade dos participantes.' 
      },
      { 
        q: 'Onde se realizam os eventos Speed Dating?', 
        a: 'Os eventos são realizados em locais de fácil acesso e com ambiente neutro, geralmente em: Bares/Restaurantes modernos e aconchegantes. Salões de Eventos ou espaços privados e versáteis adaptados para receber o público. A escolha do local visa oferecer um ambiente seguro e agradável que facilite a interação e a conversa.' 
      },
      { 
        q: 'Vocês verificam a identidade dos participantes?', 
        a: 'Sim, solicitamos documentos durante a inscrição para garantir a autenticidade de todos os participantes.' 
      },
      { 
        q: 'Minha escolha de NÃO é confidencial?', 
        a: 'Totalmente. Ninguém sabe quem você rejeitou. Apenas matches positivos geram troca de contatos.' 
      },
      { 
        q: 'E se alguém de quem não gostei insistir em falar comigo?', 
        a: 'Não se preocupe! As conversas no Flashdate têm tempo determinado, e todos devem seguir as regras. Se por acaso você se sentir em uma conversa inconveniente, pode pedir licença de forma educada para se ausentar brevemente (ir ao banheiro ou pegar uma bebida). Você não tem obrigação de ficar no encontro. Além disso, seu contato só será passado às pessoas com as quais você der "match" ou "talvez". Em caso isolado de qualquer importunação durante ou após o evento, você deve avisar imediatamente o Host (organizador). Nossos hosts são treinados para contornar a situação com discrição. Dependendo da gravidade, o infrator(a) será banido(a) de eventos futuros, pois temos uma política de tolerância zero com desrespeito.' 
      },
    ]
  },
  {
    category: 'Dress Code e Preparação',
    questions: [
      { 
        q: 'O que devo vestir para um evento de speed dating?', 
        a: 'Priorize o estilo casual, elegante e confortável, focando em causar uma boa primeira impressão que reflita sua personalidade. Evite usar boné, camisetas esportivas (times de futebol), shorts e calças de moletom, pois não são apropriados para o evento.' 
      },
      { 
        q: 'Como causar uma boa impressão durante o speed dating?', 
        a: 'Aqui estão as dicas resumidas: 1) Preparação e Aparência: Vista-se de forma elegante e confortável. A primeira impressão é visual, e estar bem-apresentado demonstra respeito pelo evento e por si mesmo. Preste atenção especial ao hálito, unhas e perfume moderado. 2) Para a parte da conversa, priorize estes pontos: Sorria e Olhe: Mantenha um sorriso e contato visual para mostrar simpatia e presença. Seja Interessante e Interessado: Faça perguntas abertas sobre as paixões da pessoa e escute ativamente o que ela diz. Positividade: Mantenha o tom leve, evite queixas e conte histórias que revelem sua essência.' 
      },
    ]
  },
  {
    category: 'Durante o Evento',
    questions: [
      { 
        q: 'Existe alguma regra ou conduta que terei de respeitar se participar de um evento Speed Dating?', 
        a: 'Sim, a conduta é crucial: 1) Pontualidade: Chegue na hora para não prejudicar a rotação dos encontros. 2) Respeito: Trate todos os participantes e a equipe com respeito, mantendo uma atitude positiva. 3) Privacidade: Não insista em pedir contatos pessoais durante o encontro e use linguagem apropriada. 4) Tempo: Respeite rigorosamente o tempo limite estipulado de 5 a 10 minutos de cada rodada, movendo-se ao sinal sonoro.' 
      },
      { 
        q: 'Apenas (05 a 10) minutos são suficientes para se conhecer uma pessoa?', 
        a: 'Sim, 5 a 10 minutos são suficientes para avaliar três pontos cruciais: 1) Aparência e Confiança: Causar uma primeira impressão física e visual. 2) Comunicação e Química: Sentir o senso de humor e a fluidez da conversa e a "química" inicial. 3) Potencial para o Futuro: Sentir se há compatibilidade de ambas as partes para investir em um segundo encontro. O objetivo principal não é conhecer a pessoa profundamente, mas sim determinar se a conexão inicial justifica um segundo encontro especial.' 
      },
      { 
        q: 'Que perguntas devo fazer durante o speed dating?', 
        a: 'Sempre seja você mesmo, o que for pra ser será! De qualquer forma tente ser mais ousado(a) e criativo(a), isso ajuda muito a interação. Aqui vão algumas perguntas que funcionam bem: CENÁRIOS DE ESCOLHA RÁPIDA: "Qual a coisa mais estranha que você faz quando está totalmente sozinho(a)?" (Revela vulnerabilidade e senso de humor) | "Se você tivesse que dar uma palestra de 10 minutos sobre qualquer coisa, qual seria o assunto?" (Mostra paixão e conhecimento inesperado) | "Qual é o pior conselho que você já recebeu, mas que te fez rir?" (Avalia a forma como a pessoa lida com o ridículo) | "Você prefere pequenas reuniões entre amigos ou festas com muitas pessoas? Por quê?" (Classifica introversão versus extroversão). VALORES E PRIORIDADES: "Existe algum momento ou período da história que você gostaria de ter vivido?" (Vai além de preferências, revelando curiosidade cultural) | "Qual falha ou erro você está trabalhando ativamente para corrigir em si mesmo(a)?" (Demonstra capacidade de autocrítica) | "Se você pudesse ter uma música tocando toda vez que entrasse em um ambiente, qual seria?" (É divertido e revela a trilha sonora de sua vida) | "Qual é a prioridade número um para a sua vida hoje?" (Direto ao ponto para entender ambições). PERGUNTAS DE CONEXÃO IMEDIATA: "O que te atraiu em mim (neste ambiente/no nosso perfil) inicialmente?" (Faz a pessoa focar na interação atual) | "Se pudéssemos ir a qualquer lugar do mundo amanhã, onde iríamos e qual seria a primeira coisa que faríamos ao chegar?" (Testa a capacidade de sonhar junto).' 
      },
      { 
        q: 'O que devo evitar perguntar durante o speed dating?', 
        a: 'Evite perguntas que sejam muito invasivas, pesadas ou que gastem tempo precioso do encontro: POLÊMICO - Religião ou Política Extrema: Tópicos que geram debate acalorado e polarização. INVASIVO - Renda/Salário: Questões sobre finanças pessoais e patrimônio. PESADO - Ex-Parceiros/Términos: Detalhes de como e por que o relacionamento anterior acabou. CLICHÊ - Perguntas "Sim/Não": Qualquer pergunta que não exija uma resposta detalhada. ÍNTIMO - Assuntos Sexuais/Traumáticos: Questões muito pessoais ou que exijam sensibilidade inadequada para o tempo.' 
      },
      { 
        q: 'E se eu sentir timidez ou nervosismo?', 
        a: 'É completamente normal! Nosso ambiente é projetado para ser acolhedor. Nossa equipe está preparada para ajudar você a se sentir confortável.' 
      },
    ]
  },
  {
    category: 'Matches e Resultados',
    questions: [
      { 
        q: 'Quando recebo os resultados?', 
        a: 'Você receberá a confirmação dos matchs mútuos por e-mail em até 24 horas após o evento.' 
      },
      { 
        q: 'Como funciona o sistema de match?', 
        a: 'SIM + SIM = Match (contatos trocados). SIM + TALVEZ ou TALVEZ + SIM = Amizade (contatos trocados). Qualquer NÃO = Nenhum contato.' 
      },
      { 
        q: 'Quando é que terei acesso ao contato de uma pessoa que me interessei durante o evento?', 
        a: 'O processo costuma ser o seguinte: 1) Registro de Interesse: Após os encontros, você registra, por meio de uma plataforma ou formulário, as pessoas com quem gostaria de manter contato (match ou talvez). 2) Verificação de Match: A organização cruza os dados para ver se a pessoa que você selecionou também te selecionou ("Deu Match" ou Talvez). 3) Liberação do Contato: Apenas se houver match mútuo ou talvez (ambos se selecionaram), a plataforma libera o contato (geralmente e-mail ou telefone) para ambos os participantes. Isso garante que ambos os lados tenham expressado interesse antes que a informação de contato seja compartilhada.' 
      },
      { 
        q: 'Como saberei se alguém demonstrou interesse por mim?', 
        a: 'Se vocês dois se selecionarem como match, a organização do evento (geralmente por meio de uma plataforma ou e-mail) envia uma notificação informando que houve o match e libera as informações de contato um do outro (como e-mail ou telefone). Se a pessoa se interessou por você, mas você não a selecionou como match / talvez, ou vice-versa, o contato não é liberado.' 
      },
      { 
        q: 'Quantos matches (combinações) posso esperar conseguir no speed dating?', 
        a: 'Em eventos comuns de speed dating, é normal ter uma média de 2 a 5 matches. Porém, a quantidade não é o foco do Flashdate. Com a utilização da Inteligência Artificial (IA), aumentamos as suas chances de conseguir matches de qualidade, e não apenas de quantidade. Nosso sistema prioriza conexões com alta compatibilidade, visando facilitar uma conexão verdadeira e o início de um relacionamento significativo.' 
      },
      { 
        q: 'Existe alguma garantia que encontrarei alguém compatível comigo?', 
        a: 'Não há garantia absoluta, pois o match final depende da química e da sorte. A porcentagem de compatibilidade será informada na sua ficha, e ela dependerá da quantidade de pessoas compatíveis que estiverem presentes no evento (em um evento pode haver muitas pessoas compatíveis com você, e em outro menos pessoas compatíveis). Contudo, a IA é uma aliada poderosa para unir os pares com maior potencial, maximizando suas chances de sucesso.' 
      },
      { 
        q: 'O que devo fazer se não conseguir nenhum match (combinação)?', 
        a: 'Não se preocupe! Existem muitas pessoas compatíveis com você. Se no evento de que você participou não houve um match, haverá outros encontros. Ao participar mais vezes, você aumenta suas chances de encontrar alguém que seja seu número. Por probabilidade, quanto mais você participa, maiores são as suas oportunidades!' 
      },
      { 
        q: 'O que acontece se eu não gostar de ninguém no speed dating?', 
        a: 'É pouco provável que você não encontre ninguém interessante, pois o Flashdate utiliza IA para priorizar encontros com alta compatibilidade e tempo de conversa estendido (10 minutos). No entanto, sempre consideramos os fatores essenciais de química pessoal e sorte. Nosso evento garante um mínimo de 10 pessoas do sexo oposto, mas ao termos 15 ou 20 participantes do sexo oposto, suas chances de encontrar o match ideal e desenvolver uma conexão significativa aumentam consideravelmente. Além disso, se você não tiver boa sorte em um evento, nada impede que você participe de outros. Você é livre para se inscrever em quantos eventos desejar!' 
      },
    ]
  },
  {
    category: 'Participantes e Público',
    questions: [
      { 
        q: 'Que tipos de pessoas frequentam eventos de speed dating?', 
        a: 'Perfil Comum dos Participantes: 1) Pessoas Ocupadas/Sem Tempo: Profissionais que têm rotinas intensas e acham o método eficiente para conhecer várias pessoas em pouco tempo. 2) Com Bom Nível Socioeconômico e Cultural: Muitos eventos, especialmente os segmentados, atraem pessoas financeiramente estáveis e com boa formação. 3) Faixa Etária Principal: Embora haja eventos para todas as idades, os maiores grupos geralmente estão nas faixas dos 30, 40 e 50 anos, buscando relacionamentos. 4) Intenção de Relacionamento Sério: Uma parcela significativa busca conexões para namoro ou algo mais duradouro. 5) Tímidos ou Avessos a Abordagens: O ambiente estruturado é ideal para quem não tomaria a iniciativa de abordar alguém em uma situação social comum.' 
      },
      { 
        q: 'Qual a idade das pessoas que participam dos eventos de speed dating?', 
        a: 'A idade das pessoas que participam de eventos de speed dating (ou Flashdate) é bastante diversificada, pois os eventos são frequentemente segmentados por faixa etária. Em geral, os eventos costumam atender a solteiros que buscam conexões sérias, com o público variando principalmente entre: Idade Mínima: Geralmente a partir de 18 a 21 anos (maiores de idade). Público Principal: As faixas mais comuns são 25 a 35 anos, 30 a 40 anos e 40 a 50 anos, pois buscam eficiência na vida social devido a carreiras consolidadas. Também existem alguns eventos temáticos com idades mais variáveis. Obs: Antes de se inscrever em algum evento escolhido, verifique sempre a faixa etária e sempre haverá uma tolerância mínima para mais ou para menos da idade estipulada.' 
      },
      { 
        q: 'Poderá qualquer pessoa assistir aos eventos Speed Dating?', 
        a: 'O evento Flash Date em si é restrito e reservado apenas para os participantes inscritos. No entanto, como os eventos ocorrem frequentemente em locais abertos ao público (como bares ou restaurantes), seus amigos ou parentes podem ficar na área pública do local sem participar do evento de Speed Dating.' 
      },
      { 
        q: 'Posso ir ao speed dating sozinho(a) ou devo levar um(a) amigo(a)?', 
        a: 'Sim, você pode ir sozinho(a) e isso é até recomendado, pois a maioria dos participantes comparece dessa forma, isso garante que você esteja focado(a) em conhecer os outros participantes. No entanto, se você tiver amigos(as) que queiram participar também, não há problema algum! Eles(as) são muito bem-vindos(as) e podem se inscrever para o evento. A única ressalva é que, durante o evento de speed dating em si, vocês não ficarão na mesma mesa. A organização garante que cada pessoa terá encontros individuais apenas com aqueles que a IA identificou como seus matches mais compatíveis, mantendo o foco em conexões de alta qualidade. A ideia é que, no final, você e seus amigos(as) possam sair juntos(as) e trocar as experiências da noite!' 
      },
      { 
        q: 'Posso participar de vários eventos de speed dating?', 
        a: 'Com certeza, no contexto do Flashdate, a recorrência é uma estratégia inteligente por três motivos: 1) Aumento de Probabilidade: Quanto mais pessoas você conhece, maior a chance estatística de encontrar um match ideal. 2) Novos Grupos: Cada evento atrai um público diferente, permitindo que você explore novos perfis e círculos sociais. 3) Prática e Socialização: Participar de vários eventos ajuda a perder o nervosismo inicial, deixando suas conversas mais naturais e atraentes.' 
      },
    ]
  },
  {
    category: 'Introversão e Personalidade',
    questions: [
      { 
        q: 'Pessoas introvertidas podem ter sucesso no speed dating?', 
        a: 'Sim, pessoas introvertidas podem ter muito sucesso no speed dating, e o formato tem vantagens únicas para elas. Muitas vezes, a introversão é confundida com timidez, mas ela é, na verdade, um estilo diferente de recarregar as energias (preferindo a solidão) e de se conectar (priorizando a profundidade à quantidade). O speed dating é um ambiente favorável aos introvertidos por vários motivos: ✅ Estrutura Definida: O evento é organizado e cronometrado. O introvertido não precisa se preocupar em iniciar ou terminar conversas aleatoriamente. ✅ Conversas Focadas: O tempo limitado (5 a 10 minutos) força a conversa a ser intencional e profunda mais rapidamente, o que é o tipo de conexão que os introvertidos preferem. ✅ Qualidade vs. Quantidade: O introvertido se destaca em observar e ouvir atentamente. Essa habilidade inata de dar atenção total em um curto período é um grande atrativo. ✅ Filtro Eficaz: Como o objetivo é selecionar com quem ter um segundo encontro, o formato utilizando IA funciona como um filtro eficiente, protegendo a energia do introvertido.' 
      },
    ]
  },
  {
    category: 'Pós-Evento',
    questions: [
      { 
        q: 'O que acontece depois de um evento de speed dating?', 
        a: 'Pós-Evento Imediato: Você tem a liberdade de permanecer no local o tempo que desejar para continuar conversando com participantes que despertaram seu interesse. Comidas e bebidas podem ser consumidas, mas devem ser adquiridas à parte, junto ao estabelecimento. Registro de Matchs: É crucial que você registre suas escolhas no formulário fornecido. Este registro é essencial para que a IA processe a compatibilidade. Resultados: Você receberá a confirmação dos matchs mútuos por e-mail em até 24 horas.' 
      },
    ]
  },
  {
    category: 'LGBT+ e Inclusão',
    questions: [
      { 
        q: 'Há eventos de Speed Dating exclusivos para LGBT+ também?', 
        a: 'Sim, definitivamente há eventos de Speed Dating exclusivos para o público LGBT+. Esses eventos têm crescido em popularidade. Os eventos exclusivos para a comunidade LGBT+ geralmente se dividem em grupos específicos para garantir a compatibilidade de interesse dos participantes: 🏳️‍🌈 Speed Dating Gay: Eventos voltados para homens que procuram outros homens. 🏳️‍🌈 Speed Dating Lésbico: Eventos voltados para mulheres que procuram outras mulheres. 🏳️‍🌈 Eventos Trans e Não-Binários: Eventos mais inclusivos, embora sejam menos frequentes que os anteriores. Nosso objetivo é garantir que todos os participantes usem a nossa Inteligência Artificial (IA) rigorosa para maximizar as chances de encontrar um match de alta compatibilidade em um ambiente seguro e acolhedor. Fique de olho em nosso calendário de eventos para saber as próximas datas e formatos específicos!' 
      },
      { 
        q: 'Vocês realizam eventos LGBT+?', 
        a: 'Sim! Aproximadamente 12% da população é LGBT+ e nossa missão é unir casais independente do sexo ou orientação sexual.' 
      },
      { 
        q: 'Como me cadastro para eventos LGBT+?', 
        a: 'Preencha o formulário específico em nosso site informando sua identidade de gênero, orientação sexual e preferências.' 
      },
      { 
        q: 'Os eventos LGBT+ são separados?', 
        a: 'Sim, realizamos eventos específicos para garantir que todos os participantes tenham a melhor experiência possível.' 
      },
    ]
  },
];

export const FAQSection = () => {
  return (
    <section id="faq" className="h-full bg-background relative overflow-hidden flex flex-col">
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

        {/* Events Gallery */}
        <div className="max-w-5xl mx-auto mt-20">
          <div className="text-center mb-12">
            <h3 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Veja Nossos Eventos em <span className="text-gradient-gold">Ação</span>
            </h3>
            <p className="text-muted-foreground text-lg">
              Confira como são nossos eventos de speed dating em ambientes elegantes e acolhedores
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl overflow-hidden border border-border shadow-elegant hover:shadow-lg transition-shadow">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F1eb056757fdd408fb16c0434aacb3dcd%2F4c6a42da1a654661a002b9df6c0a40a4?format=webp&width=800"
                alt="Evento Flashdate - Participantes em speed dating"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="rounded-2xl overflow-hidden border border-border shadow-elegant hover:shadow-lg transition-shadow">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F1eb056757fdd408fb16c0434aacb3dcd%2F308f5dc2d9da4ceda9523eb08cf3ba9c?format=webp&width=800"
                alt="Evento Flashdate - Ambiente de encontros com mascote"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
