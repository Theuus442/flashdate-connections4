import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#como-funciona', label: 'Como Funciona' },
  { href: '#proximo-evento', label: 'Próximo Evento' },
  { href: '#lgbtq', label: 'LGBT+' },
  { href: '#sobre', label: 'Sobre Nós' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contato', label: 'Contato' },
];

interface HeaderProps {
  currentSectionId?: string;
}

export const Header = ({ currentSectionId }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-lg border-b border-border shadow-elegant'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F0b16f2a8970443a0b7d02d6ff7c28cc7%2F728ec6c60764404790cd1aae17f7869e?format=webp&width=800"
              alt="Flashdate Logo"
              className="h-10 w-auto"
            />
            <span className="hidden sm:inline font-bold text-lg text-foreground">
              FlashDate<span className="text-wine">⚡</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const sectionId = link.href.slice(1);
              const isActive = currentSectionId === sectionId;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors duration-300 ${
                    isActive
                      ? 'text-wine font-semibold'
                      : 'text-foreground/80 hover:text-wine'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Button variant="emerald" size="sm" asChild>
              <a href="#proximo-evento">Inscreva-se</a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-foreground hover:text-wine transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background backdrop-blur-xl border-t border-border">
          <nav className="container mx-auto px-6 py-6 flex flex-col gap-4">
            {navLinks.map((link) => {
              const sectionId = link.href.slice(1);
              const isActive = currentSectionId === sectionId;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-base font-medium transition-colors duration-300 py-2 ${
                    isActive
                      ? 'text-wine font-semibold'
                      : 'text-foreground hover:text-wine'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Button variant="emerald" className="w-full" asChild>
                <a href="#proximo-evento" onClick={() => setIsMobileMenuOpen(false)}>
                  Inscreva-se
                </a>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
