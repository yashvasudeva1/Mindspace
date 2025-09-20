import { useState } from 'react';
import { MessageCircle, BookOpen, Trophy, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ChatWidget from '@/components/ChatWidget';
import heroImage from '@/assets/hero-wellness.jpg';
import { Link } from 'react-router-dom';

const quickActions = [
  {
    title: 'Start Journal Entry',
    description: 'Reflect on your day and track your emotions',
    icon: BookOpen,
    href: '/journal',
    gradient: 'from-secondary-soft to-tertiary-soft',
  },
  {
    title: 'View Progress',
    description: 'See your wellness journey and achievements',
    icon: Trophy,
    href: '/progress',
    gradient: 'from-primary-soft to-accent-soft',
  },
  {
    title: 'Find Resources',
    description: 'Discover helpful articles and self-care tips',
    icon: Sparkles,
    href: '/resources',
    gradient: 'from-tertiary-soft to-secondary-soft',
  },
];

export default function Home() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Peaceful wellness illustration"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background-subtle/80" />
        </div>
        
        <div className="relative px-4 lg:px-8 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Your Mental Wellness Journey Starts Here
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                A safe, confidential space for young minds to grow, reflect, and find support. 
                You're not alone in this journey. 💜
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => setShowChat(!showChat)}
                className="bg-gradient-primary text-primary-foreground px-8 py-3 text-lg hover:opacity-90 transition-all duration-200 hover:scale-105"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                {showChat ? 'Hide Chat' : 'Start Chatting'}
              </Button>
              <Link to="/journal">
                <Button variant="outline" className="px-8 py-3 text-lg hover:bg-muted/50">
                  Begin Journaling
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Section */}
      {showChat && (
        <section className="px-4 lg:px-8 pb-8 animate-slide-in-bottom">
          <div className="max-w-4xl mx-auto">
            <ChatWidget isExpanded={true} />
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="px-4 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            What would you like to do today?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} to={action.href}>
                  <Card className={`wellness-card bg-gradient-to-br ${action.gradient} p-6 h-full group cursor-pointer`}>
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-16 h-16 rounded-radius-lg bg-card/80 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                        <p className="text-muted-foreground">{action.description}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Daily Encouragement */}
      <section className="px-4 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="mood-card">
            <h3 className="text-xl font-semibold mb-4">Today's Wellness Reminder 🌱</h3>
            <p className="text-lg text-muted-foreground">
              "Progress isn't about being perfect—it's about being kind to yourself and taking small steps forward. 
              Every moment you choose self-compassion is a victory worth celebrating."
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}