
CREATE TABLE public.user_view_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  context_type text NOT NULL,
  context_id text,
  view_type text NOT NULL DEFAULT 'list',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_user_view_prefs_unique
  ON public.user_view_preferences(user_id, context_type, COALESCE(context_id, '__null__'));

ALTER TABLE public.user_view_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own view preferences"
  ON public.user_view_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own view preferences"
  ON public.user_view_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own view preferences"
  ON public.user_view_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own view preferences"
  ON public.user_view_preferences FOR DELETE
  USING (auth.uid() = user_id);
