import { Check, X, UserPlus } from 'lucide-react';

const matchLogic = [
  {
    yourChoice: 'SIM',
    theirChoice: 'SIM',
    result: 'MATCH',
    icon: Check,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    description: 'Conexão perfeita! Vocês receberão os contatos um do outro.',
  },
  {
    yourChoice: 'SIM',
    theirChoice: 'TALVEZ',
    result: 'AMIZADE',
    icon: UserPlus,
    color: 'text-gold',
    bgColor: 'bg-gold/20',
    description: 'Uma possível conexão. Contatos trocados para explorar.',
  },
  {
    yourChoice: 'TALVEZ',
    theirChoice: 'SIM',
    result: 'AMIZADE',
    icon: UserPlus,
    color: 'text-gold',
    bgColor: 'bg-gold/20',
    description: 'Uma possível conexão. Contatos trocados para explorar.',
  },
  {
    yourChoice: 'NÃO',
    theirChoice: 'Qualquer',
    result: 'NENHUM CONTATO',
    icon: X,
    color: 'text-wine-light',
    bgColor: 'bg-wine/20',
    description: 'Privacidade respeitada. Nenhum contato será trocado.',
  },
];

export const MatchLogicSection = () => {
  return (
    <section className="py-24 bg-elegant-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-wine/10 via-transparent to-transparent" />
      
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
            O contato só é liberado se houver SIM ou TALVEZ mútuo. Sua privacidade é sempre respeitada.
          </p>
        </div>

        {/* Match Logic Cards */}
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-4">
            {matchLogic.map((item, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-6 border border-border hover:border-gold/30 transition-all duration-300 shadow-elegant"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                  {/* Your Choice */}
                  <div className="flex items-center gap-3 md:w-1/4">
                    <span className="text-sm text-muted-foreground">Sua Escolha:</span>
                    <span className={`px-3 py-1 rounded-full font-semibold text-sm ${
                      item.yourChoice === 'SIM' ? 'bg-green-500/20 text-green-400' :
                      item.yourChoice === 'TALVEZ' ? 'bg-gold/20 text-gold' :
                      'bg-wine/20 text-wine-light'
                    }`}>
                      {item.yourChoice}
                    </span>
                  </div>

                  {/* Their Choice */}
                  <div className="flex items-center gap-3 md:w-1/4">
                    <span className="text-sm text-muted-foreground">Outra Pessoa:</span>
                    <span className={`px-3 py-1 rounded-full font-semibold text-sm ${
                      item.theirChoice === 'SIM' ? 'bg-green-500/20 text-green-400' :
                      item.theirChoice === 'TALVEZ' ? 'bg-gold/20 text-gold' :
                      'bg-wine/20 text-wine-light'
                    }`}>
                      {item.theirChoice}
                    </span>
                  </div>

                  {/* Arrow */}
                  <div className="hidden md:flex items-center justify-center">
                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
                  </div>

                  {/* Result */}
                  <div className="flex items-center gap-3 md:flex-1">
                    <div className={`w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <span className={`font-serif font-bold ${item.color}`}>{item.result}</span>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="mt-8 p-6 rounded-xl bg-gold/5 border border-gold/20 text-center">
            <p className="text-foreground/80 text-sm">
              <strong className="text-gold">Nota Importante:</strong> O contato só é liberado se houver SIM ou TALVEZ mútuo. 
              Qualquer escolha com NÃO resulta em nenhum contato trocado.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
