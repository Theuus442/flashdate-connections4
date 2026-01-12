import { SectionNavigator } from '@/components/SectionNavigator';
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
  const sections = [
    {
      id: 'home',
      content: <HeroSection />,
    },
    {
      id: 'como-funciona',
      content: (
        <>
          <HowItWorksSection />
          <MatchLogicSection />
        </>
      ),
    },
    {
      id: 'proximo-evento',
      content: <NextEventSection />,
    },
    {
      id: 'lgbtq',
      content: <LGBTSection />,
    },
    {
      id: 'sobre',
      content: <AboutSection />,
    },
    {
      id: 'faq',
      content: <FAQSection />,
    },
    {
      id: 'contato',
      content: (
        <>
          <NewsletterSection />
          <Footer />
        </>
      ),
    },
  ];

  return <SectionNavigator sections={sections} />;
};

export default Index;
