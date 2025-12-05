import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Briefcase,
  GraduationCap,
  Search, 
  TrendingUp, 
  MapPin
} from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-card relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <Badge className="mb-6 glass-card text-primary border-primary/30 text-lg px-6 py-2 animate-bounce-in">
            Platform Features
          </Badge>
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-8 animate-fade-in-up leading-tight">
            Everything You Need to
            <span className="block text-gradient-animate mt-2">
              Advance Your Career
            </span>
          </h2>
          <p className="text-2xl text-muted-foreground max-w-4xl mx-auto animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.2s' }}>
            Our comprehensive platform connects education and employment, making it easier 
            than ever to find the right path for your career goals.
          </p>
        </div>
      </div>
    </section>
  );
};