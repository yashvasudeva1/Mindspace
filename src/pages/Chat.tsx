import ChatWidget from '@/components/ChatWidget';
import { MessageCircle, Heart, Shield, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

const chatFeatures = [
  {
    icon: Heart,
    title: 'Always Supportive',
    description: 'Our AI is trained to provide empathetic, non-judgmental responses',
    color: 'text-accent'
  },
  {
    icon: Shield,
    title: 'Completely Private',
    description: 'Your conversations are confidential and never shared',
    color: 'text-primary'
  },
  {
    icon: Clock,
    title: 'Available 24/7',
    description: 'Get support whenever you need it, day or night',
    color: 'text-secondary'
  }
];

export default function Chat() {
  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">Wellness Chat</h1>
              <p className="text-muted-foreground">
                Share your thoughts in a safe, supportive space. I'm here to listen and help you navigate your feelings. 💜
              </p>
            </div>
            
            <ChatWidget isExpanded={true} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Chat Features */}
            <Card className="wellness-card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Why Chat With Us?
              </h2>
              
              <div className="space-y-4">
                {chatFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex gap-3">
                      <div className="w-10 h-10 rounded-radius bg-muted/30 flex items-center justify-center">
                        <Icon className={`h-5 w-5 ${feature.color}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Quick Topics */}
            <Card className="wellness-card p-6">
              <h2 className="text-lg font-semibold mb-4">Need Ideas? Try These Topics</h2>
              
              <div className="space-y-2">
                {[
                  'How I\'m feeling today',
                  'Something that\'s worrying me',
                  'A challenge I\'m facing',
                  'What I\'m grateful for',
                  'My goals and dreams',
                  'Coping strategies that help',
                  'Relationships in my life',
                  'School or work stress'
                ].map((topic, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-3 rounded-radius-sm hover:bg-muted/50 transition-colors text-sm"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </Card>

            {/* Crisis Resources */}
            <Card className="mood-card p-6">
              <h2 className="text-lg font-semibold mb-4">Need Immediate Help?</h2>
              
              <div className="space-y-3 text-sm">
                <div>
                  <h3 className="font-medium">Crisis Text Line</h3>
                  <p className="text-muted-foreground">Text HOME to 741741</p>
                </div>
                
                <div>
                  <h3 className="font-medium">National Suicide Prevention Lifeline</h3>
                  <p className="text-muted-foreground">Call 988</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Teen Line</h3>
                  <p className="text-muted-foreground">Call 1-800-852-8336</p>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground mt-4">
                Remember: You're not alone, and it's okay to ask for help.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}