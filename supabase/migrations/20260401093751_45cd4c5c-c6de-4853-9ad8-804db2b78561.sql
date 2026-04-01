
-- Focus Sessions table
CREATE TABLE public.focus_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 1500,
  focus_minutes INTEGER NOT NULL DEFAULT 25,
  break_minutes INTEGER NOT NULL DEFAULT 5,
  session_type TEXT NOT NULL DEFAULT 'focus',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  session_tag TEXT,
  ambient_sound TEXT,
  strict_mode BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own focus sessions" ON public.focus_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own focus sessions" ON public.focus_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own focus sessions" ON public.focus_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own focus sessions" ON public.focus_sessions FOR DELETE USING (auth.uid() = user_id);

-- Journey Progress table
CREATE TABLE public.journey_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_altitude INTEGER NOT NULL DEFAULT 0,
  current_tier TEXT NOT NULL DEFAULT 'valley',
  streak_days INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  total_focus_minutes INTEGER NOT NULL DEFAULT 0,
  last_focus_date DATE,
  badges JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.journey_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journey" ON public.journey_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own journey" ON public.journey_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journey" ON public.journey_progress FOR UPDATE USING (auth.uid() = user_id);

-- Profile additions for focus preferences
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS focus_default_minutes INTEGER NOT NULL DEFAULT 25,
  ADD COLUMN IF NOT EXISTS break_default_minutes INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS ambient_sound_preference TEXT,
  ADD COLUMN IF NOT EXISTS companion_style TEXT NOT NULL DEFAULT 'lantern',
  ADD COLUMN IF NOT EXISTS daily_focus_goal INTEGER NOT NULL DEFAULT 120;
