import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Briefcase, 
  Search,
  Filter,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const QualificationFilter: React.FC = () => {
  const [selectedQualification, setSelectedQualification] = useState<string | null>(null);

  const qualifications = [
    {
      id: 'ol',
      title: 'O/L Completed',
      description: 'Ordinary Level qualifications',
      courses: '150+ Courses',
      jobs: '300+ Jobs',
      icon: '📚',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'al',
      title: 'A/L Completed',
      description: 'Advanced Level qualifications',
      courses: '200+ Courses',
      jobs: '450+ Jobs',
      icon: '🎓',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'diploma',
      title: 'Diploma',
      description: 'Diploma level qualifications',
      courses: '120+ Courses',
      jobs: '350+ Jobs',
      icon: '📜',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'degree',
      title: 'Degree',
      description: 'Bachelor\'s degree and above',
      courses: '180+ Courses',
      jobs: '500+ Jobs',
      icon: '🏆',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Find Opportunities by Your 
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Qualification</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select your current qualification level to discover relevant courses and job opportunities tailored for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {qualifications.map((qual) => (
            <Card 
              key={qual.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:-translate-y-2 ${
                selectedQualification === qual.id 
                  ? 'ring-2 ring-primary bg-gradient-card' 
                  : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedQualification(qual.id)}
            >
              <CardHeader className="text-center">
                <div className="text-4xl mb-3">{qual.icon}</div>
                <CardTitle className="text-lg">{qual.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{qual.description}</p>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                <div className="flex justify-between text-sm">
                  <Badge variant="secondary" className="bg-education/10 text-education">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    {qual.courses}
                  </Badge>
                  <Badge variant="secondary" className="bg-jobs/10 text-jobs">
                    <Briefcase className="w-3 h-3 mr-1" />
                    {qual.jobs}
                  </Badge>
                </div>
                
                {selectedQualification === qual.id && (
                  <div className="flex flex-col space-y-2 animate-fade-in-up">
                    <Button 
                      size="sm" 
                      className="bg-education hover:bg-education/90"
                      asChild
                    >
                      <Link to={`/courses?qualification=${qual.id}`}>
                        <GraduationCap className="w-4 h-4 mr-2" />
                        View Courses
                      </Link>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-jobs text-jobs hover:bg-jobs hover:text-jobs-foreground"
                      asChild
                    >
                      <Link to={`/jobs?qualification=${qual.id}`}>
                        <Briefcase className="w-4 h-4 mr-2" />
                        View Jobs
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Search */}
        <Card className="max-w-2xl mx-auto bg-gradient-card shadow-elegant">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search courses, jobs, or institutions..."
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <Button className="md:px-8 shadow-glow">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};