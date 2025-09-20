-- Create user_settings table to store user preferences
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  
  -- Notification preferences
  daily_reminder BOOLEAN DEFAULT true,
  goal_achievement BOOLEAN DEFAULT true,
  weekly_reflection BOOLEAN DEFAULT true,
  supportive_messages BOOLEAN DEFAULT true,
  
  -- Privacy preferences  
  data_collection BOOLEAN DEFAULT false,
  analytics BOOLEAN DEFAULT true,
  share_progress BOOLEAN DEFAULT false,
  
  -- Appearance preferences
  theme VARCHAR(50) DEFAULT 'lavender',
  font_size VARCHAR(20) DEFAULT 'medium',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own settings" 
ON public.user_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
ON public.user_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.user_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" 
ON public.user_settings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();