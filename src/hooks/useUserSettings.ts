import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserSettings {
  // Notification preferences
  daily_reminder: boolean;
  goal_achievement: boolean;
  weekly_reflection: boolean;
  supportive_messages: boolean;
  
  // Privacy preferences  
  data_collection: boolean;
  analytics: boolean;
  share_progress: boolean;
  
  // Appearance preferences
  theme: string;
  font_size: string;
}

const defaultSettings: UserSettings = {
  daily_reminder: true,
  goal_achievement: true,
  weekly_reflection: true,
  supportive_messages: true,
  data_collection: false,
  analytics: true,
  share_progress: false,
  theme: 'lavender',
  font_size: 'medium',
};

export function useUserSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      if (data) {
        setSettings({
          daily_reminder: data.daily_reminder,
          goal_achievement: data.goal_achievement,
          weekly_reflection: data.weekly_reflection,
          supportive_messages: data.supportive_messages,
          data_collection: data.data_collection,
          analytics: data.analytics,
          share_progress: data.share_progress,
          theme: data.theme,
          font_size: data.font_size,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user) return;

    try {
      // First try to update existing record
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingSettings) {
        // Update existing settings
        const { error } = await supabase
          .from('user_settings')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            ...updates,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      setSettings(prev => ({ ...prev, ...updates }));
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    refetch: fetchSettings
  };
}