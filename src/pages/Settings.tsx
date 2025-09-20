import { useState, useEffect } from 'react';
import { User, Bell, Shield, Palette, Download, Trash2, LogOut } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const themes = [
  { name: 'Lavender Dreams', value: 'lavender', colors: ['hsl(250, 55%, 65%)', 'hsl(270, 45%, 75%)'] },
  { name: 'Mint Serenity', value: 'mint', colors: ['hsl(160, 40%, 75%)', 'hsl(180, 35%, 80%)'] },
  { name: 'Peach Calm', value: 'peach', colors: ['hsl(25, 80%, 75%)', 'hsl(45, 70%, 80%)'] },
  { name: 'Ocean Breeze', value: 'ocean', colors: ['hsl(200, 60%, 70%)', 'hsl(220, 50%, 75%)'] },
];

const avatarOptions = [
  '🌱', '🦋', '🌸', '🍃', '🌙', '☀️', '🌈', '💫'
];

export default function Settings() {
  const { user } = useAuth();
  const { profile, displayName, avatarEmoji, updateProfile } = useUserProfile();
  const { settings, loading, updateSettings } = useUserSettings();
  const { applyTheme, applyFontSize } = useTheme();
  
  const [localDisplayName, setLocalDisplayName] = useState('');
  const [localAvatar, setLocalAvatar] = useState('🌱');
  const [localTheme, setLocalTheme] = useState('lavender');
  const [localFontSize, setLocalFontSize] = useState('medium');
  const [hasChanges, setHasChanges] = useState(false);

  // Update local state when profile loads
  useEffect(() => {
    setLocalDisplayName(displayName);
    setLocalAvatar(avatarEmoji);
  }, [displayName, avatarEmoji]);

  // Update local state when settings load
  useEffect(() => {
    if (!loading) {
      setLocalTheme(settings.theme);
      setLocalFontSize(settings.font_size);
    }
  }, [settings, loading]);

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(localTheme);
  }, [localTheme, applyTheme]);

  // Apply font size when it changes
  useEffect(() => {
    applyFontSize(localFontSize);
  }, [localFontSize, applyFontSize]);

  // Track changes
  useEffect(() => {
    const hasProfileChanges = localDisplayName !== displayName || localAvatar !== avatarEmoji;
    const hasSettingsChanges = localTheme !== settings.theme || localFontSize !== settings.font_size;
    setHasChanges(hasProfileChanges || hasSettingsChanges);
  }, [localDisplayName, localAvatar, localTheme, localFontSize, displayName, avatarEmoji, settings]);

  const saveChanges = async () => {
    // Save profile changes
    await updateProfile({
      display_name: localDisplayName || null,
      avatar_url: localAvatar
    });

    // Save settings changes
    await updateSettings({
      theme: localTheme,
      font_size: localFontSize,
    });

    setHasChanges(false);
  };

  const exportData = () => {
    // Export functionality would be implemented here
    console.log('Exporting user data...');
  };

  const deleteAllData = () => {
    // Delete data functionality would be implemented here
    console.log('Deleting all user data...');
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Settings</h1>
          <p className="text-muted-foreground">
            Customize your MindSpace experience to feel just right for you 🛠️
          </p>
        </div>

        {/* Profile Section */}
        <Card className="wellness-card p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </h2>

          <div className="space-y-6">
            {/* Avatar Selection */}
            <div className="space-y-4">
              <Label>Choose Your Avatar</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl bg-gradient-primary text-primary-foreground">
                    {localAvatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex gap-2 flex-wrap">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setLocalAvatar(avatar)}
                      className={`w-12 h-12 rounded-radius-lg border-2 flex items-center justify-center text-xl transition-all duration-200 hover:scale-110 ${
                        localAvatar === avatar 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border bg-card hover:border-primary/50'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                placeholder="How should we call you?"
                value={localDisplayName}
                onChange={(e) => setLocalDisplayName(e.target.value)}
                className="wellness-input max-w-xs"
              />
              <p className="text-sm text-muted-foreground">
                This is how you'll appear in the app. Choose something that feels right for you.
              </p>
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card className="wellness-card p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </h2>

          <div className="space-y-6">
            {/* Theme Selection */}
            <div className="space-y-4">
              <Label>Color Theme</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {themes.map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => setLocalTheme(theme.value)}
                    className={`p-4 rounded-radius-lg border-2 transition-all duration-200 hover:scale-105 ${
                      localTheme === theme.value 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border bg-card hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {theme.colors.map((color, index) => (
                          <div
                            key={index}
                            className="w-6 h-6 rounded-full border border-white/20"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="font-medium">{theme.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <Label>Text Size</Label>
              <Select value={localFontSize} onValueChange={setLocalFontSize}>
                <SelectTrigger className="wellness-input max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="extra-large">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="wellness-card p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Daily Reflection Reminder</h3>
                <p className="text-sm text-muted-foreground">Get a gentle nudge to journal each day</p>
              </div>
              <Switch
                checked={settings.daily_reminder}
                onCheckedChange={(checked) => updateSettings({ daily_reminder: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Achievement Celebrations</h3>
                <p className="text-sm text-muted-foreground">Be notified when you reach milestones</p>
              </div>
              <Switch
                checked={settings.goal_achievement}
                onCheckedChange={(checked) => updateSettings({ goal_achievement: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Weekly Reflection Prompts</h3>
                <p className="text-sm text-muted-foreground">Thoughtful questions to help you reflect</p>
              </div>
              <Switch
                checked={settings.weekly_reflection}
                onCheckedChange={(checked) => updateSettings({ weekly_reflection: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Supportive Messages</h3>
                <p className="text-sm text-muted-foreground">Encouraging words when you need them most</p>
              </div>
              <Switch
                checked={settings.supportive_messages}
                onCheckedChange={(checked) => updateSettings({ supportive_messages: checked })}
              />
            </div>
          </div>
        </Card>

        {/* Privacy & Data */}
        <Card className="wellness-card p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Data
          </h2>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Data Collection for Improvement</h3>
                  <p className="text-sm text-muted-foreground">Help us improve the app with anonymous usage data</p>
                </div>
                <Switch
                  checked={settings.data_collection}
                  onCheckedChange={(checked) => updateSettings({ data_collection: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Analytics & Insights</h3>
                  <p className="text-sm text-muted-foreground">Allow us to provide personalized wellness insights</p>
                </div>
                <Switch
                  checked={settings.analytics}
                  onCheckedChange={(checked) => updateSettings({ analytics: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Share Progress with Support Network</h3>
                  <p className="text-sm text-muted-foreground">Let trusted contacts see your wellness journey</p>
                </div>
                <Switch
                  checked={settings.share_progress}
                  onCheckedChange={(checked) => updateSettings({ share_progress: checked })}
                />
              </div>
            </div>

            {/* Data Management */}
            <div className="pt-4 space-y-4">
              <h3 className="font-medium text-muted-foreground">Data Management</h3>
              
              <div className="flex gap-4">
                <Button variant="outline" onClick={exportData} className="hover:bg-muted/50">
                  <Download className="h-4 w-4 mr-2" />
                  Export My Data
                </Button>
                
                <Button variant="outline" onClick={deleteAllData} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All Data
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Your privacy is important to us. You have full control over your data at all times.
              </p>
            </div>
          </div>
        </Card>

        {/* Account Actions */}
        <Card className="wellness-card p-6">
          <h2 className="text-xl font-semibold mb-6">Account</h2>
          
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full hover:bg-muted/50"
              onClick={() => {
                supabase.auth.signOut();
                window.location.href = '/';
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
            
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Need help? Contact our support team at{' '}
                <a href="mailto:support@mindspace.app" className="text-primary hover:underline">
                  support@mindspace.app
                </a>
              </p>
            </div>
          </div>
        </Card>

        {/* Save Changes */}
        <div className="text-center">
          <Button 
            className="bg-gradient-primary hover:opacity-90 px-8"
            onClick={saveChanges}
            disabled={!hasChanges}
          >
            {hasChanges ? 'Save Changes' : 'All Changes Saved'}
          </Button>
        </div>
      </div>
    </div>
  );
}