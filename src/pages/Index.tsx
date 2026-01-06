import { TabNavigation } from '@/components/TabNavigation';
import { HeroSection } from '@/components/HeroSection';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { MatchLogicSection } from '@/components/MatchLogicSection';
import { NextEventSection } from '@/components/NextEventSection';
import { LGBTSection } from '@/components/LGBTSection';
import { WhoAttendsSection } from '@/components/WhoAttendsSection';
import { AboutSection } from '@/components/AboutSection';
import { FAQSection } from '@/components/FAQSection';
import { NewsletterSection } from '@/components/NewsletterSection';
import { Footer } from '@/components/Footer';

const Index = () => {
  const tabs = [
    {
      id: 'home',
      label: 'Home',
      content: (
        <>
          <HeroSection />
        </>
      ),
    },
    {
      id: 'como-funciona',
      label: 'Como Funciona',
      content: (
        <div className="space-y-12">
          <HowItWorksSection />
          <MatchLogicSection />
        </div>
      ),
    },
    {
      id: 'proximo-evento',
      label: 'Próximo Evento',
      content: (
        <>
          <NextEventSection />
        </>
      ),
    },
    {
      id: 'lgbtq',
      label: 'LGBT+',
      content: (
        <>
          <LGBTSection />
        </>
      ),
    },
    {
      id: 'quem-frequenta',
      label: 'Quem Frequenta',
      content: (
        <>
          <WhoAttendsSection />
        </>
      ),
    },
    {
      id: 'sobre',
      label: 'Sobre',
      content: (
        <>
          <AboutSection />
        </>
      ),
    },
    {
      id: 'faq',
      label: 'FAQ',
      content: (
        <>
          <FAQSection />
        </>
      ),
    },
    {
      id: 'contato',
      label: 'Contato',
      content: (
        <>
          <NewsletterSection />
          <Footer />
        </>
      ),
    },
  ];

  return <TabNavigation tabs={tabs} />;
};

export default Index;
