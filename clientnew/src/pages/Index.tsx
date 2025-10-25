import React from 'react';
import { Navigation } from '@/components/ui/navigation';
import { HeroSection } from '@/components/hero-section';
import { QualificationFilter } from '@/components/qualification-filter';
import { FeaturesSection } from '@/components/features-section';
import { Footer } from '@/components/footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <QualificationFilter />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default Index;
