import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Briefcase, 
  Users, 
  Search,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const HeroSection: React.FC = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-hero animate-gradient-shift opacity-90" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0">
        {/* Top decorative elements */}
        <div className="absolute top-20 left-10 animate-float">
          <div className="glass-card p-6 rounded-2xl animate-pulse-glow">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
        </div>
        <div className="absolute top-32 right-16 animate-float" style={{ animationDelay: '1s' }}>
          <div className="glass-card p-5 rounded-2xl">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="absolute top-60 left-1/4 animate-float" style={{ animationDelay: '3s' }}>
          <div className="glass-card p-4 rounded-xl">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
        </div>
        
        {/* Bottom decorative elements */}
        <div className="absolute bottom-32 left-16 animate-float" style={{ animationDelay: '2s' }}>
          <div className="glass-card p-5 rounded-2xl">
            <Users className="w-9 h-9 text-white" />
          </div>
        </div>
        <div className="absolute bottom-48 right-20 animate-float" style={{ animationDelay: '4s' }}>
          <div className="glass-card p-4 rounded-xl animate-pulse-glow">
            <Search className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="absolute bottom-20 right-1/3 animate-float" style={{ animationDelay: '5s' }}>
          <div className="glass-card p-3 rounded-lg">
            <MapPin className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-5xl mx-auto">
          <Badge className="mb-8 glass-card text-white border-white/30 hover:bg-white/20 text-base px-6 py-2 animate-bounce-in">
            <MapPin className="w-5 h-5 mr-2" />
            Connecting Sri Lankan Talent
          </Badge>
          
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 animate-fade-in-up leading-tight">
            Your Career Journey
            <span className="block text-gradient-animate text-6xl md:text-8xl mt-2">
              Starts Here
            </span>
          </h1>
          
          <p className="text-xl md:text-3xl text-white/95 mb-12 max-w-4xl mx-auto animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.2s' }}>
            The unified platform linking educational pathways and employment opportunities 
            by qualification in Sri Lanka. Find courses, discover jobs, and build your future.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-glow hover-lift text-lg px-8 py-4 h-auto animate-pulse-glow" asChild>
              <Link to="/CoursesFront">
                <GraduationCap className="w-6 h-6 mr-3" />
                Explore Courses
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="glass-card text-white hover:bg-white/20 border-white/40 hover-lift text-lg px-8 py-4 h-auto" asChild>
              <Link to="/JobsFront">
                <Briefcase className="w-6 h-6 mr-3" />
                Find Jobs
              </Link>
            </Button>
          </div>

          {/* Enhanced stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Card className="glass-card hover-lift group cursor-pointer">
              <CardContent className="p-8 text-center">
                <div className="mb-4">
                  <GraduationCap className="w-12 h-12 text-white mx-auto group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-4xl font-bold text-white mb-3 text-gradient-animate">500+</div>
                <div className="text-white/90 text-lg font-medium">Educational Programs</div>
                <div className="text-white/70 text-sm mt-2">Across all qualification levels</div>
              </CardContent>
            </Card>
            <Card className="glass-card hover-lift group cursor-pointer">
              <CardContent className="p-8 text-center">
                <div className="mb-4">
                  <Briefcase className="w-12 h-12 text-white mx-auto group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-4xl font-bold text-white mb-3 text-gradient-animate">1000+</div>
                <div className="text-white/90 text-lg font-medium">Job Opportunities</div>
                <div className="text-white/70 text-sm mt-2">Updated daily from top companies</div>
              </CardContent>
            </Card>
            <Card className="glass-card hover-lift group cursor-pointer">
              <CardContent className="p-8 text-center">
                <div className="mb-4">
                  <Users className="w-12 h-12 text-white mx-auto group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-4xl font-bold text-white mb-3 text-gradient-animate">50+</div>
                <div className="text-white/90 text-lg font-medium">Partner Institutions</div>
                <div className="text-white/70 text-sm mt-2">Universities and training centers</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};