import { useState } from 'react';
import { Search, Phone, Globe, Heart, Users, BookOpen, AlertTriangle, ExternalLink, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: 'crisis' | 'professional' | 'education' | 'community' | 'self-care';
  type: 'hotline' | 'website' | 'app' | 'article' | 'video';
  contact?: string;
  website?: string;
  rating?: number;
  tags: string[];
  urgent?: boolean;
}

const resources: Resource[] = [
  // Crisis Resources
  {
    id: '1',
    title: 'National Suicide Prevention Lifeline',
    description: '24/7, free and confidential support for people in distress, prevention and crisis resources.',
    category: 'crisis',
    type: 'hotline',
    contact: '988',
    website: 'https://suicidepreventionlifeline.org',
    rating: 5,
    tags: ['suicide prevention', '24/7', 'crisis'],
    urgent: true
  },
  {
    id: '2',
    title: 'Crisis Text Line',
    description: 'Free, 24/7 support for those in crisis. Text HOME to connect with a counselor.',
    category: 'crisis',
    type: 'hotline',
    contact: 'Text HOME to 741741',
    website: 'https://crisistextline.org',
    rating: 5,
    tags: ['text support', '24/7', 'crisis'],
    urgent: true
  },
  {
    id: '3',
    title: 'Teen Line',
    description: 'Confidential telephone helpline for teenagers, operated by trained teen volunteers.',
    category: 'crisis',
    type: 'hotline',
    contact: '1-800-852-8336',
    website: 'https://teenlineonline.org',
    rating: 4,
    tags: ['teens', 'peer support', 'confidential'],
    urgent: true
  },
  
  // Professional Help
  {
    id: '4',
    title: 'Psychology Today',
    description: 'Find therapists, psychiatrists, and mental health professionals in your area.',
    category: 'professional',
    type: 'website',
    website: 'https://psychologytoday.com',
    rating: 4,
    tags: ['therapist finder', 'professionals', 'directory']
  },
  {
    id: '5',
    title: 'BetterHelp',
    description: 'Online counseling platform connecting you with licensed therapists.',
    category: 'professional',
    type: 'website',
    website: 'https://betterhelp.com',
    rating: 4,
    tags: ['online therapy', 'licensed', 'convenient']
  },
  {
    id: '6',
    title: 'Open Path Collective',
    description: 'Affordable therapy sessions ranging from $30-$60 per session.',
    category: 'professional',
    type: 'website',
    website: 'https://openpathcollective.org',
    rating: 4,
    tags: ['affordable therapy', 'low cost', 'sliding scale']
  },

  // Educational Resources
  {
    id: '7',
    title: 'National Institute of Mental Health',
    description: 'Comprehensive information about mental health conditions, treatments, and research.',
    category: 'education',
    type: 'website',
    website: 'https://nimh.nih.gov',
    rating: 5,
    tags: ['research', 'conditions', 'treatments', 'official']
  },
  {
    id: '8',
    title: 'Mental Health America',
    description: 'Educational resources, screening tools, and advocacy information.',
    category: 'education',
    type: 'website',
    website: 'https://mhanational.org',
    rating: 4,
    tags: ['screening', 'education', 'advocacy']
  },
  {
    id: '9',
    title: 'Mindfulness-Based Stress Reduction Course',
    description: 'Free 8-week online course teaching mindfulness techniques for stress and anxiety.',
    category: 'education',
    type: 'video',
    website: 'https://palousemindfulness.com',
    rating: 5,
    tags: ['mindfulness', 'stress reduction', 'free course', 'meditation']
  },

  // Community Resources
  {
    id: '10',
    title: 'NAMI Support Groups',
    description: 'Free support groups for individuals and families affected by mental illness.',
    category: 'community',
    type: 'website',
    website: 'https://nami.org/Support-Education/Support-Groups',
    rating: 4,
    tags: ['support groups', 'families', 'peer support', 'free']
  },
  {
    id: '11',
    title: 'Reddit Mental Health Communities',
    description: 'Online communities for support, advice, and connection with others.',
    category: 'community',
    type: 'website',
    website: 'https://reddit.com/r/mentalhealth',
    rating: 3,
    tags: ['online community', 'peer support', 'forums']
  },
  {
    id: '12',
    title: '7 Cups',
    description: 'Free emotional support through trained volunteer listeners.',
    category: 'community',
    type: 'website',
    website: 'https://7cups.com',
    rating: 4,
    tags: ['emotional support', 'listeners', 'free', '24/7']
  },

  // Self-Care Resources
  {
    id: '13',
    title: 'Headspace',
    description: 'Meditation and mindfulness app with guided sessions for mental wellness.',
    category: 'self-care',
    type: 'app',
    website: 'https://headspace.com',
    rating: 4,
    tags: ['meditation', 'mindfulness', 'guided', 'app']
  },
  {
    id: '14',
    title: 'Calm',
    description: 'Sleep stories, meditation, and relaxation techniques for better mental health.',
    category: 'self-care',
    type: 'app',
    website: 'https://calm.com',
    rating: 4,
    tags: ['sleep', 'meditation', 'relaxation', 'stories']
  },
  {
    id: '15',
    title: 'Self-Care Techniques Guide',
    description: 'Comprehensive guide to daily self-care practices for mental wellness.',
    category: 'self-care',
    type: 'article',
    website: 'https://mhanational.org/self-care',
    rating: 4,
    tags: ['self-care', 'daily practices', 'wellness', 'guide']
  }
];

export default function Resources() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const crisisResources = resources.filter(r => r.urgent);
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'crisis': return AlertTriangle;
      case 'professional': return Users;
      case 'education': return BookOpen;
      case 'community': return Heart;
      case 'self-care': return Star;
      default: return Globe;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'crisis': return 'bg-destructive text-destructive-foreground';
      case 'professional': return 'bg-primary text-primary-foreground';
      case 'education': return 'bg-secondary text-secondary-foreground';
      case 'community': return 'bg-accent text-accent-foreground';
      case 'self-care': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const openResource = (resource: Resource) => {
    if (resource.website) {
      window.open(resource.website, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Mental Health Resources</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find support, education, and tools to help you on your mental wellness journey. 
            Remember, seeking help is a sign of strength, not weakness. 💪
          </p>
        </div>

        {/* Crisis Resources Alert */}
        <Card className="mood-card p-6 border-destructive/20">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-destructive mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-3 text-destructive">
                Need Help Right Now?
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {crisisResources.map((resource) => (
                  <div key={resource.id} className="bg-card p-4 rounded-radius-lg border">
                    <h3 className="font-medium text-sm mb-2">{resource.title}</h3>
                    <div className="space-y-2">
                      {resource.contact && (
                        <p className="text-lg font-bold text-destructive">{resource.contact}</p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openResource(resource)}
                        className="w-full"
                      >
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Visit Website
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Search and Filter */}
        <Card className="wellness-card p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 wellness-input"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All
              </Button>
              {['crisis', 'professional', 'education', 'community', 'self-care'].map((category) => {
                const Icon = getCategoryIcon(category);
                return (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    <Icon className="h-3 w-3 mr-2" />
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                  </Button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => {
            const Icon = getCategoryIcon(resource.category);
            return (
              <Card key={resource.id} className="wellness-card p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-radius ${getCategoryColor(resource.category)}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {resource.type}
                      </Badge>
                    </div>
                    {resource.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{resource.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="font-semibold mb-2">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {resource.description}
                    </p>
                    
                    {resource.contact && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-primary" />
                          <span className="font-medium">{resource.contact}</span>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {resource.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {resource.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{resource.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {resource.website && (
                      <Button
                        onClick={() => openResource(resource)}
                        className="flex-1"
                        size="sm"
                      >
                        <ExternalLink className="h-3 w-3 mr-2" />
                        {resource.type === 'hotline' ? 'Get Help' : 'Visit'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* No Results */}
        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No resources found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or category filter.
            </p>
          </div>
        )}

        {/* Additional Help */}
        <Card className="wellness-card p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Need More Help?</h2>
          <p className="text-muted-foreground mb-6">
            If you can't find what you're looking for, consider reaching out to a mental health professional 
            or contacting a crisis helpline for immediate support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => setSelectedCategory('crisis')} variant="outline">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Crisis Resources
            </Button>
            <Button onClick={() => setSelectedCategory('professional')} variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Find a Professional
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}