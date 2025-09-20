import { useState, useEffect } from 'react';
import { Calendar, Mic, MicOff, Save, Trash2, Plus, BookOpen, Edit, MoreVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const moods = [
  { emoji: '😊', name: 'Great', value: 5 },
  { emoji: '🙂', name: 'Good', value: 4 },
  { emoji: '😐', name: 'Okay', value: 3 },
  { emoji: '🙁', name: 'Low', value: 2 },
  { emoji: '😢', name: 'Difficult', value: 1 },
];

const emotions = [
  'Happy', 'Grateful', 'Peaceful', 'Excited', 'Proud', 'Loved',
  'Anxious', 'Stressed', 'Sad', 'Frustrated', 'Lonely', 'Overwhelmed',
  'Confused', 'Tired', 'Hopeful', 'Calm', 'Motivated', 'Creative'
];

interface JournalEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood_level: number;
  emotions: string[];
  is_voice_entry: boolean;
  created_at: string;
  updated_at: string;
}

export default function Journal() {
  const [selectedMood, setSelectedMood] = useState<number>(3);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [entryTitle, setEntryTitle] = useState('');
  const [entryContent, setEntryContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchEntries();
      setupRealtimeSubscription();
    }
  }, [user]);

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('journal-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'journal_entries',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setEntries(prev => [payload.new as JournalEntry, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setEntries(prev => 
              prev.map(entry => 
                entry.id === payload.new.id ? payload.new as JournalEntry : entry
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setEntries(prev => prev.filter(entry => entry.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchEntries = async () => {
    if (!user) return;

    try {
      setInitialLoading(true);
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load journal entries",
        variant: "destructive"
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion) 
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Voice recording functionality would be implemented here
  };

  const saveEntry = async () => {
    if (!entryContent.trim() || !user) {
      toast({
        title: "Missing Content",
        description: "Please write something before saving your entry",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      if (editingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('journal_entries')
          .update({
            title: entryTitle,
            content: entryContent,
            mood_level: selectedMood,
            emotions: selectedEmotions,
            is_voice_entry: isRecording
          })
          .eq('id', editingEntry.id);

        if (error) throw error;

        toast({
          title: "Entry Updated",
          description: "Your journal entry has been updated successfully"
        });
      } else {
        // Create new entry
        const { error } = await supabase
          .from('journal_entries')
          .insert({
            user_id: user.id,
            title: entryTitle,
            content: entryContent,
            mood_level: selectedMood,
            emotions: selectedEmotions,
            is_voice_entry: isRecording
          });

        if (error) throw error;

        toast({
          title: "Entry Saved",
          description: "Your journal entry has been saved successfully"
        });
      }

      clearEntry();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to ${editingEntry ? 'update' : 'save'} journal entry`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearEntry = () => {
    setEntryTitle('');
    setEntryContent('');
    setSelectedEmotions([]);
    setSelectedMood(3);
    setIsRecording(false);
    setEditingEntry(null);
  };

  const editEntry = (entry: JournalEntry) => {
    setEntryTitle(entry.title);
    setEntryContent(entry.content);
    setSelectedMood(entry.mood_level);
    setSelectedEmotions(entry.emotions || []);
    setEditingEntry(entry);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteEntry = async (entry: JournalEntry) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entry.id);

      if (error) throw error;

      toast({
        title: "Entry Deleted",
        description: "Your journal entry has been deleted"
      });

      setDeleteDialogOpen(false);
      setEntryToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete journal entry",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClick = (entry: JournalEntry) => {
    setEntryToDelete(entry);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Your Wellness Journal</h1>
          <p className="text-muted-foreground">
            Take a moment to reflect on your thoughts and feelings. This is your safe space. 📝💜
          </p>
        </div>

        {/* New Entry Form */}
        <Card className="wellness-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              {editingEntry ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingEntry ? 'Edit Entry' : 'New Entry'}
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          {/* Mood Selector */}
          <div className="space-y-4">
            <Label className="text-base font-medium">How are you feeling today?</Label>
            <div className="flex justify-center gap-4">
              {moods.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`mood-emoji text-4xl p-3 rounded-radius-lg transition-all duration-200 ${
                    selectedMood === mood.value ? 'selected' : ''
                  }`}
                >
                  {mood.emoji}
                  <div className="text-xs mt-1 text-muted-foreground">{mood.name}</div>
                </button>
              ))}
            </div>
            
            {/* Mood Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Difficult</span>
                <span>Okay</span>
                <span>Great</span>
              </div>
              <Slider
                value={[selectedMood]}
                onValueChange={(value) => setSelectedMood(value[0])}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Emotion Selector */}
          <div className="space-y-4">
            <Label className="text-base font-medium">What emotions are you experiencing?</Label>
            <div className="flex flex-wrap gap-2">
              {emotions.map((emotion) => (
                <Button
                  key={emotion}
                  variant={selectedEmotions.includes(emotion) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleEmotion(emotion)}
                  className={`text-xs transition-all duration-200 ${
                    selectedEmotions.includes(emotion) 
                      ? 'bg-gradient-primary text-primary-foreground' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  {emotion}
                </Button>
              ))}
            </div>
          </div>

          {/* Entry Title */}
          <div className="space-y-2">
            <Label htmlFor="entry-title">Entry Title (optional)</Label>
            <Input
              id="entry-title"
              placeholder="Give your entry a title..."
              value={entryTitle}
              onChange={(e) => setEntryTitle(e.target.value)}
              className="wellness-input"
            />
          </div>

          {/* Entry Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="entry-content">What's on your mind?</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleRecording}
                className={`transition-colors ${
                  isRecording ? 'text-accent animate-pulse' : ''
                }`}
              >
                {isRecording ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                {isRecording ? 'Stop Recording' : 'Voice Entry'}
              </Button>
            </div>
            
            {isRecording ? (
              <Card className="p-8 text-center bg-gradient-to-r from-accent-soft to-primary-soft">
                <div className="breathing-circle w-16 h-16 bg-accent rounded-full mx-auto mb-4" />
                <p className="text-accent-foreground font-medium">Recording your voice entry...</p>
                <p className="text-sm text-accent-foreground/80 mt-1">Speak freely, your words are safe here</p>
              </Card>
            ) : (
              <Textarea
                id="entry-content"
                placeholder="Share your thoughts, feelings, experiences, or anything that's important to you today. There's no right or wrong way to express yourself here..."
                value={entryContent}
                onChange={(e) => setEntryContent(e.target.value)}
                className="wellness-input min-h-[200px] resize-vertical"
                rows={8}
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={saveEntry}
              disabled={(!entryContent.trim() && !isRecording) || loading}
              className="flex-1 bg-gradient-primary hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {loading ? "Saving..." : editingEntry ? "Update Entry" : "Save Entry"}
            </Button>
            <Button
              variant="outline"
              onClick={clearEntry}
              className="hover:bg-muted/50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </Card>

        {/* Recent Entries */}
        <Card className="wellness-card p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Entries</h2>
          {initialLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-4 bg-muted/30">
                  <div className="flex justify-between items-start mb-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-3" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </Card>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No entries yet. Start by sharing what's on your mind above! 💜</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <Card key={entry.id} className="p-4 bg-muted/30 hover:bg-muted/40 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{entry.title || 'Untitled Entry'}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => editEntry(entry)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Entry
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(entry)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Entry
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                    {entry.content}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{moods.find(m => m.value === entry.mood_level)?.emoji}</span>
                    <div className="flex flex-wrap gap-1">
                      {(entry.emotions || []).slice(0, 3).map(emotion => (
                        <Badge key={emotion} variant="secondary" className="text-xs">
                          {emotion}
                        </Badge>
                      ))}
                      {(entry.emotions || []).length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{(entry.emotions || []).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete "{entryToDelete?.title || 'this entry'}"? 
                This action cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => entryToDelete && deleteEntry(entryToDelete)}
                >
                  Delete Entry
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}