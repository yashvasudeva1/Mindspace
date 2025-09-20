import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface UserProfile {
  display_name: string | null;
  avatar_url: string | null;
}

export function useUserProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>({
    display_name: null,
    avatar_url: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      setProfile({
        display_name: data?.display_name || null,
        avatar_url: data?.avatar_url || null
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      // First try to update existing record
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Insert new profile
        const { error } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            ...updates,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      setProfile(prev => ({ ...prev, ...updates }));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const displayName = profile.display_name || user?.email?.split('@')[0] || 'User';
  const avatarEmoji = profile.avatar_url || '🌱';

  return {
    profile,
    displayName,
    avatarEmoji,
    loading,
    updateProfile,
    refetch: fetchProfile
  };
}