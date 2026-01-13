import { Check, X, UserPlus, Heart } from 'lucide-react';

const matchLogic = [
  {
    yourChoice: 'MATCH',
    theirChoice: 'MATCH',
    result: 'MATCH',
    icon: Heart,
    color: 'text-secondary',
    bgColor: 'bg-secondary/20',
    borderColor: 'border-secondary/30',
    description: 'Conexão perfeita! Vocês receberão os contatos um do outro.',
  },
  {
    yourChoice: 'MATCH',
    theirChoice: 'AMIZADE',
    result: 'AMIZADE',
    icon: UserPlus,
    color: 'text-gold',
    bgColor: 'bg-gold/20',
    borderColor: 'border-gold/30',
    description: 'Uma possível conexão. Contatos trocados para explorar.',
  },
  {
    yourChoice: 'AMIZADE',
    theirChoice: 'MATCH',
    result: 'AMIZADE',
    icon: UserPlus,
    color: 'text-gold',
    bgColor: 'bg-gold/20',
    borderColor: 'border-gold/30',
    description: 'Uma possível conexão. Contatos trocados para explorar.',
  },
  {
    yourChoice: 'AMIZADE',
    theirChoice: 'AMIZADE',
    result: 'AMIZADE',
    icon: UserPlus,
    color: 'text-gold',
    bgColor: 'bg-gold/20',
    borderColor: 'border-gold/30',
    description: 'Ambos abertos para amizade. Contatos trocados para explorar.',
  },
  {
    yourChoice: 'Sem interesse',
    theirChoice: 'Qualquer',
    result: 'NENHUM CONTATO',
    icon: X,
    color: 'text-wine-light',
    bgColor: 'bg-wine/20',
    borderColor: 'border-wine/30',
    description: 'Privacidade respeitada. Nenhum contato será trocado.',
  },
];

export const MatchLogicSection = () => {
  return (
    <section className="min-h-full bg-background relative flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-muted/15 via-transparent to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-gold text-sm font-medium tracking-widest uppercase mb-4">
            Entenda o Sistema
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Lógica de <span className="text-gradient-gold">Match</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            O contato só é liberado se houver Match ou Amizade mútua. Sua privacidade é sempre respeitada.
          </p>
        </div>

        {/* Match Logic Table */}
        <div className="max-w-4xl mx-auto">
          {/* Desktop Table */}
          <div className="hidden md:block bg-card rounded-2xl border border-border overflow-hidden shadow-elegant">
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 p-6 bg-secondary/10 border-b border-border">
              <div className="text-center">
                <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Sua Escolha</span>
              </div>
              <div className="text-center">
                <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Outra Pessoa</span>
              </div>
              <div className="text-center">
                <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Resultado</span>
              </div>
              <div className="text-center">
                <span className="text-sm font-semibold text-secondary uppercase tracking-wider">O que acontece</span>
              </div>
            </div>

            {/* Table Rows */}
            {matchLogic.map((item, index) => (
              <div
                key={index}
                className={`grid grid-cols-4 gap-4 p-6 items-center ${
                  index !== matchLogic.length - 1 ? 'border-b border-border/50' : ''
                } hover:bg-muted/20 transition-colors`}
              >
                <div className="text-center">
                  <span className={`inline-block px-4 py-2 rounded-full font-bold text-sm ${
                    item.yourChoice === 'MATCH' ? 'bg-green-500/20 text-green-400' :
                    item.yourChoice === 'AMIZADE' ? 'bg-secondary/20 text-secondary' :
                    'bg-primary/20 text-primary'
                  }`}>
                    {item.yourChoice}
                  </span>
                </div>
                <div className="text-center">
                  <span className={`inline-block px-4 py-2 rounded-full font-bold text-sm ${
                    item.theirChoice === 'MATCH' ? 'bg-green-500/20 text-green-400' :
                    item.theirChoice === 'AMIZADE' ? 'bg-secondary/20 text-secondary' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {item.theirChoice}
                  </span>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full ${item.bgColor} flex items-center justify-center`}>
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <span className={`font-serif font-bold ${item.color}`}>{item.result}</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">{item.description}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {matchLogic.map((item, index) => (
              <div
                key={index}
                className={`bg-card rounded-xl p-6 border ${item.borderColor} shadow-elegant`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                      item.yourChoice === 'MATCH' ? 'bg-green-500/20 text-green-400' :
                      item.yourChoice === 'AMIZADE' ? 'bg-secondary/20 text-secondary' :
                      'bg-primary/20 text-primary'
                    }`}>
                      {item.yourChoice}
                    </span>
                    <span className="text-muted-foreground">+</span>
                    <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                      item.theirChoice === 'MATCH' ? 'bg-green-500/20 text-green-400' :
                      item.theirChoice === 'AMIZADE' ? 'bg-secondary/20 text-secondary' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {item.theirChoice}
                    </span>
                  </div>
                  <div className={`w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                </div>
                <h4 className={`font-serif text-lg font-bold ${item.color} mb-2`}>{item.result}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="mt-8 p-6 rounded-xl bg-secondary/5 border border-secondary/20 text-center">
            <p className="text-foreground/80 text-sm">
              <strong className="text-secondary">Nota Importante:</strong> O contato só é liberado se houver Match ou Amizade mútua.
              Qualquer escolha com "Não faz meu tipo" resulta em nenhum contato trocado. Sua privacidade é nossa prioridade.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
