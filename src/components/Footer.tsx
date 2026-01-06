import { Mail, Phone, AlertCircle, Heart } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-graphite-light border-t border-border">
      {/* Main Footer */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#home" className="inline-block mb-6 flex items-center gap-3">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F73d680b1b3a649a9a5bc7e1247d963e4%2F685f0706602c47e4964899c8526c67cd?format=webp&width=800"
                alt="Flashdate Logo"
                className="h-12 w-auto"
              />
              <span className="font-bold text-2xl text-foreground">
                Flash<span className="text-gold">⚡</span>Date
              </span>
            </a>
            <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
              A plataforma pioneira de encontros presenciais que utiliza IA para identificar 
              seu match com maior potencial. Acreditamos que há alguém procurando exatamente por você.
            </p>
            <div className="flex items-center gap-2 text-gold">
              <Heart className="w-4 h-4" />
              <span className="text-sm">Encontre sua conexão verdadeira</span>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-bold text-foreground mb-6">Contato</h4>
            <div className="space-y-4">
              <a
                href="mailto:contato@flashdate.com.br"
                className="flex items-center gap-3 text-muted-foreground hover:text-gold transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>contato@flashdate.com.br</span>
              </a>
              <a
                href="tel:+5511970329710"
                className="flex items-center gap-3 text-muted-foreground hover:text-gold transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>(11) 9 7032-9710</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-bold text-foreground mb-6">Links Rápidos</h4>
            <nav className="space-y-3">
              <a href="#como-funciona" className="block text-muted-foreground hover:text-gold transition-colors">
                Como Funciona
              </a>
              <a href="#proximo-evento" className="block text-muted-foreground hover:text-gold transition-colors">
                Próximo Evento
              </a>
              <a href="#lgbtq" className="block text-muted-foreground hover:text-gold transition-colors">
                LGBT+
              </a>
              <a href="#faq" className="block text-muted-foreground hover:text-gold transition-colors">
                FAQ
              </a>
            </nav>
          </div>
        </div>

        {/* Notice */}
        <div className="mt-12 p-6 rounded-2xl bg-wine/10 border border-wine/20">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-wine-light flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-semibold text-foreground mb-2">Aviso Importante</h5>
              <p className="text-muted-foreground text-sm">
                A transferência de ingresso é permitida até 5 dias antes do evento, 
                desde que seja para pessoa do mesmo sexo. O valor do ingresso não é reembolsável.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {currentYear} Flashdate. Todos os direitos reservados.</p>
            <p className="flex items-center gap-2">
              Feito com <Heart className="w-4 h-4 text-wine" /> para conectar corações
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
