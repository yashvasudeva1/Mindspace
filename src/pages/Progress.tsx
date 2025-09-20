import { Award, Target, Calendar, TrendingUp, Star, Heart, Zap, Sun, Loader2, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface JournalEntry {
  id: string;
  created_at: string;
  mood_level: number | null;
  emotions: string[] | null;
}

interface WeeklyStat {
  day: string;
  mood: number | null;
  journaled: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  total?: number;
  color: string;
  bgColor: string;
}

interface Goal {
  title: string;
  description: string;
  progress: number;
  target: number;
  type: string;
}

export default function Progress() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [currentGoals, setCurrentGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState({
    totalEntries: 0,
    currentStreak: 0,
    avgMood: 0,
    earnedAchievements: 0
  });
  
  // Goal dialog state
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', target: 7 });

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('journal_entries')
        .select('id, created_at, mood_level, emotions')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEntries(data || []);
      computeStats(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load your progress. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const computeStats = (entriesData: JournalEntry[]) => {
    const totalEntries = entriesData.length;
    
    // Calculate average mood
    const moodEntries = entriesData.filter(e => e.mood_level !== null);
    const avgMood = moodEntries.length > 0 
      ? Math.round(moodEntries.reduce((sum, e) => sum + (e.mood_level || 0), 0) / moodEntries.length * 10) / 10
      : 0;

    // Calculate current streak
    const currentStreak = calculateStreak(entriesData);

    // Calculate weekly stats (last 7 days)
    const weekStats = calculateWeeklyStats(entriesData);
    setWeeklyStats(weekStats);

    // Calculate achievements
    const achievementsData = calculateAchievements(entriesData, currentStreak);
    setAchievements(achievementsData);
    const earnedAchievements = achievementsData.filter(a => a.earned).length;

    // Set sample goals based on current progress
    const goals = generateCurrentGoals(entriesData, currentStreak);
    setCurrentGoals(goals);

    setStats({
      totalEntries,
      currentStreak,
      avgMood,
      earnedAchievements
    });
  };

  const calculateStreak = (entriesData: JournalEntry[]): number => {
    if (entriesData.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    // Group entries by date
    const entriesByDate = new Map<string, boolean>();
    entriesData.forEach(entry => {
      const entryDate = new Date(entry.created_at);
      entryDate.setHours(0, 0, 0, 0);
      const dateKey = entryDate.toISOString().split('T')[0];
      entriesByDate.set(dateKey, true);
    });

    // Count consecutive days backwards from today
    while (currentDate >= new Date('2024-01-01')) {
      const dateKey = currentDate.toISOString().split('T')[0];
      if (entriesByDate.has(dateKey)) {
        streak++;
      } else if (streak > 0) {
        break; // Streak is broken
      }
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  const calculateWeeklyStats = (entriesData: JournalEntry[]): WeeklyStat[] => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekStats: WeeklyStat[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayEntries = entriesData.filter(entry => {
        const entryDate = new Date(entry.created_at);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === date.getTime();
      });

      const avgMood = dayEntries.length > 0 
        ? Math.round(dayEntries.reduce((sum, e) => sum + (e.mood_level || 0), 0) / dayEntries.length)
        : null;

      weekStats.push({
        day: days[date.getDay()],
        mood: avgMood,
        journaled: dayEntries.length > 0
      });
    }

    return weekStats;
  };

  const calculateAchievements = (entriesData: JournalEntry[], streak: number): Achievement[] => {
    // Count unique emotions
    const allEmotions = new Set<string>();
    entriesData.forEach(entry => {
      if (entry.emotions) {
        entry.emotions.forEach(emotion => allEmotions.add(emotion));
      }
    });

    // Count morning entries (5 AM - 12 PM)
    const morningEntries = entriesData.filter(entry => {
      const hour = new Date(entry.created_at).getHours();
      return hour >= 5 && hour < 12;
    }).length;

    return [
      {
        id: '1',
        title: 'First Steps',
        description: 'Created your first journal entry',
        icon: Heart,
        earned: entriesData.length >= 1,
        earnedDate: entriesData.length >= 1 ? entriesData[entriesData.length - 1]?.created_at : undefined,
        color: 'text-accent',
        bgColor: 'bg-accent-soft'
      },
      {
        id: '2',
        title: 'Mindful Week',
        description: 'Journaled for 7 days in a row',
        icon: Star,
        earned: streak >= 7,
        earnedDate: streak >= 7 ? new Date().toISOString() : undefined,
        color: 'text-primary',
        bgColor: 'bg-primary-soft'
      },
      {
        id: '3',
        title: 'Emotion Explorer',
        description: 'Tracked 10 different emotions',
        icon: Zap,
        earned: allEmotions.size >= 10,
        progress: allEmotions.size,
        total: 10,
        color: 'text-secondary',
        bgColor: 'bg-secondary-soft'
      },
      {
        id: '4',
        title: 'Morning Sunshine',
        description: 'Complete 5 morning reflections',
        icon: Sun,
        earned: morningEntries >= 5,
        progress: morningEntries,
        total: 5,
        color: 'text-tertiary',
        bgColor: 'bg-tertiary-soft'
      }
    ];
  };

  const generateCurrentGoals = (entriesData: JournalEntry[], streak: number): Goal[] => {
    const thisWeekEntries = entriesData.filter(entry => {
      const entryDate = new Date(entry.created_at);
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      return entryDate >= weekStart;
    }).length;

    return [
      {
        title: 'Daily Journaling',
        description: 'Write in your journal every day this week',
        progress: Math.min(thisWeekEntries, 7),
        target: 7,
        type: 'streak'
      },
      {
        title: 'Mood Awareness',
        description: 'Track your mood 5 times this week',
        progress: Math.min(entriesData.filter(e => e.mood_level !== null).length, 5),
        target: 5,
        type: 'count'
      },
      {
        title: 'Consistency Challenge',
        description: 'Maintain your current streak',
        progress: Math.min(streak, 10),
        target: 10,
        type: 'activities'
      }
    ];
  };

  const handleSetNewGoal = () => {
    // For now, just store locally and show toast
    const goal: Goal = {
      title: newGoal.title,
      description: newGoal.description,
      progress: 0,
      target: newGoal.target,
      type: 'custom'
    };
    
    setCurrentGoals(prev => [...prev, goal]);
    setNewGoal({ title: '', description: '', target: 7 });
    setGoalDialogOpen(false);
    
    toast({
      title: "Goal Created!",
      description: `Your new goal "${goal.title}" has been added.`
    });
  };

  const handleViewFullHistory = () => {
    navigate('/journal');
  };

  const handleShareProgress = async () => {
    const shareData = {
      title: 'My Wellness Journey Progress',
      text: `I've made amazing progress on my wellness journey! ${stats.totalEntries} journal entries, ${stats.currentStreak} day streak, and ${stats.avgMood}/5 average mood. 🌟`,
      url: window.location.origin
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      const text = `${shareData.text} Check it out at ${shareData.url}`;
      await navigator.clipboard.writeText(text);
      toast({
        title: "Progress Shared!",
        description: "Your progress summary has been copied to clipboard."
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <Skeleton className="h-10 w-80 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-4 text-center">
                <Skeleton className="h-8 w-12 mx-auto mb-2" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </Card>
            ))}
          </div>
          
          <Card className="p-6">
            <Skeleton className="h-6 w-48 mb-6" />
            <div className="grid grid-cols-7 gap-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-4 w-8 mx-auto mb-2" />
                  <Skeleton className="h-20 w-full mb-2" />
                  <Skeleton className="h-2 w-2 mx-auto rounded-full" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Your Wellness Journey</h1>
          <p className="text-muted-foreground">
            Celebrate your progress and see how far you've come! 🌟
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="wellness-card p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">{stats.totalEntries}</div>
            <div className="text-sm text-muted-foreground">Journal Entries</div>
          </Card>
          <Card className="wellness-card p-4 text-center">
            <div className="text-2xl font-bold text-secondary mb-1">{stats.currentStreak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </Card>
          <Card className="wellness-card p-4 text-center">
            <div className="text-2xl font-bold text-tertiary mb-1">{stats.avgMood || '-'}</div>
            <div className="text-sm text-muted-foreground">Avg Mood</div>
          </Card>
          <Card className="wellness-card p-4 text-center">
            <div className="text-2xl font-bold text-accent mb-1">{stats.earnedAchievements}</div>
            <div className="text-sm text-muted-foreground">Achievements</div>
          </Card>
        </div>

        {/* Weekly Mood Tracker */}
        <Card className="wellness-card p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            This Week's Journey
          </h2>
          
          <div className="grid grid-cols-7 gap-2">
            {weeklyStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-sm text-muted-foreground mb-2">{stat.day}</div>
                <div className={`w-full h-20 rounded-radius flex flex-col items-center justify-center mb-2 transition-all duration-200 ${
                  stat.mood && stat.mood >= 4 ? 'bg-success-soft' :
                  stat.mood === 3 ? 'bg-warning-soft' :
                  stat.mood ? 'bg-muted' : 'bg-muted/50'
                }`}>
                  <div className="text-2xl mb-1">
                    {stat.mood === 5 ? '😊' :
                     stat.mood === 4 ? '🙂' :
                     stat.mood === 3 ? '😐' :
                     stat.mood === 2 ? '🙁' :
                     stat.mood === 1 ? '😢' : '💤'}
                  </div>
                  <div className="text-xs font-medium">
                    {stat.mood ? `${stat.mood}/5` : '-'}
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full mx-auto ${
                  stat.journaled ? 'bg-primary' : 'bg-muted'
                }`} />
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-6 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Journaled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-muted" />
              <span>Missed</span>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Current Goals */}
          <Card className="wellness-card p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Current Goals
            </h2>
            
            <div className="space-y-6">
              {currentGoals.map((goal, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{goal.title}</h3>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </div>
                    <span className="text-sm font-medium text-primary">
                      {goal.progress}/{goal.target}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <ProgressBar 
                      value={(goal.progress / goal.target) * 100} 
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground">
                      {Math.max(0, goal.target - goal.progress)} more to reach your goal
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full mt-6 hover:bg-muted/50">
                  <Plus className="mr-2 h-4 w-4" />
                  Set New Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="goal-title">Goal Title</Label>
                    <Input
                      id="goal-title"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Weekly Meditation"
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal-description">Description</Label>
                    <Textarea
                      id="goal-description"
                      value={newGoal.description}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your goal..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal-target">Target Number</Label>
                    <Input
                      id="goal-target"
                      type="number"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, target: parseInt(e.target.value) || 7 }))}
                      min="1"
                      max="100"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSetNewGoal} disabled={!newGoal.title.trim()} className="flex-1">
                      Create Goal
                    </Button>
                    <Button variant="outline" onClick={() => setGoalDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </Card>

          {/* Achievements */}
          <Card className="wellness-card p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements
            </h2>
            
            <div className="space-y-4">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-radius-lg border-2 transition-all duration-200 ${
                      achievement.earned
                        ? `${achievement.bgColor} border-transparent`
                        : 'bg-muted/20 border-dashed border-muted-foreground/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-radius flex items-center justify-center ${
                        achievement.earned ? achievement.bgColor : 'bg-muted'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          achievement.earned ? achievement.color : 'text-muted-foreground'
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          achievement.earned ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {achievement.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {achievement.description}
                        </p>
                        
                        {achievement.earned ? (
                          <div className="text-xs text-muted-foreground">
                            Earned on {achievement.earnedDate ? new Date(achievement.earnedDate).toLocaleDateString() : 'Today'}
                          </div>
                        ) : achievement.progress !== undefined ? (
                          <div className="space-y-1">
                            <ProgressBar 
                              value={((achievement.progress || 0) / (achievement.total || 1)) * 100} 
                              className="h-1"
                            />
                            <div className="text-xs text-muted-foreground">
                              {achievement.progress}/{achievement.total} completed
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">
                            Keep going to unlock this achievement!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Motivational Section */}
        <Card className="mood-card text-center p-6">
          <h3 className="text-xl font-semibold mb-4">You're Making Amazing Progress! 🎉</h3>
          <p className="text-muted-foreground mb-4">
            Every entry you write and every moment you spend reflecting is a step toward better mental wellness. 
            Keep up the incredible work—you're building habits that will serve you for life.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={handleViewFullHistory} className="bg-gradient-primary hover:opacity-90">
              <Calendar className="mr-2 h-4 w-4" />
              View Full History
            </Button>
            <Button onClick={handleShareProgress} variant="outline" className="hover:bg-muted/50">
              Share Progress
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}