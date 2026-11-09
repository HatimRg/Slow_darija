import { Header } from '@/components/layout/Header';
import { Hero } from '@/components/landing/Hero';
import { MethodSection } from '@/components/landing/MethodSection';
import { DarijaAudioPlayer } from '@/components/landing/DarijaAudioPlayer';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { Testimonials } from '@/components/landing/Testimonials';
import { PricingTeaser } from '@/components/landing/PricingTeaser';
import { Footer } from '@/components/layout/Footer';

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <MethodSection />
        <DarijaAudioPlayer />
        <BenefitsSection />
        <Testimonials />
        <PricingTeaser />
      </main>
      <Footer />
    </>
  );
}
