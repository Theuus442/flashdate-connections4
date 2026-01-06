import { Header } from '@/components/Header';
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
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <MatchLogicSection />
        <NextEventSection />
        <LGBTSection />
        <WhoAttendsSection />
        <AboutSection />
        <FAQSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
