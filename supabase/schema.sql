-- Pregnancy Tracker - Supabase Schema
-- Run this in your Supabase SQL Editor after creating a project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Events (Calendar)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('appointment', 'milestone', 'personal')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Important Dates
CREATE TABLE IF NOT EXISTS important_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal Entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week INTEGER NOT NULL CHECK (week >= 1 AND week <= 40),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  mood TEXT NOT NULL CHECK (mood IN ('happy', 'tired', 'emotional', 'excited')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memories (photos)
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weight Logs
CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week INTEGER NOT NULL CHECK (week >= 1 AND week <= 40),
  weight DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kicks (timestamp only, user inferred from auth)
CREATE TABLE IF NOT EXISTS kicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Contractions
CREATE TABLE IF NOT EXISTS contractions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Letters to Baby
CREATE TABLE IF NOT EXISTS letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-set user_id on insert (from auth.uid())
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make user_id optional on insert (trigger will set it)
ALTER TABLE events ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE important_dates ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE journal_entries ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE memories ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE weight_logs ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE kicks ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE contractions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE letters ALTER COLUMN user_id DROP NOT NULL;

-- Actually keep NOT NULL but use trigger - simpler: just add triggers
CREATE TRIGGER set_events_user_id BEFORE INSERT ON events
  FOR EACH ROW WHEN (NEW.user_id IS NULL)
  EXECUTE PROCEDURE set_user_id();
CREATE TRIGGER set_important_dates_user_id BEFORE INSERT ON important_dates
  FOR EACH ROW WHEN (NEW.user_id IS NULL)
  EXECUTE PROCEDURE set_user_id();
CREATE TRIGGER set_journal_entries_user_id BEFORE INSERT ON journal_entries
  FOR EACH ROW WHEN (NEW.user_id IS NULL)
  EXECUTE PROCEDURE set_user_id();
CREATE TRIGGER set_memories_user_id BEFORE INSERT ON memories
  FOR EACH ROW WHEN (NEW.user_id IS NULL)
  EXECUTE PROCEDURE set_user_id();
CREATE TRIGGER set_weight_logs_user_id BEFORE INSERT ON weight_logs
  FOR EACH ROW WHEN (NEW.user_id IS NULL)
  EXECUTE PROCEDURE set_user_id();
CREATE TRIGGER set_kicks_user_id BEFORE INSERT ON kicks
  FOR EACH ROW WHEN (NEW.user_id IS NULL)
  EXECUTE PROCEDURE set_user_id();
CREATE TRIGGER set_contractions_user_id BEFORE INSERT ON contractions
  FOR EACH ROW WHEN (NEW.user_id IS NULL)
  EXECUTE PROCEDURE set_user_id();
CREATE TRIGGER set_letters_user_id BEFORE INSERT ON letters
  FOR EACH ROW WHEN (NEW.user_id IS NULL)
  EXECUTE PROCEDURE set_user_id();

-- Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE important_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can manage own events" ON events
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own important_dates" ON important_dates
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own journal_entries" ON journal_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own memories" ON memories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own weight_logs" ON weight_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own kicks" ON kicks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own contractions" ON contractions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own letters" ON letters
  FOR ALL USING (auth.uid() = user_id);

-- Storage bucket for memories
INSERT INTO storage.buckets (id, name, public)
VALUES ('memories', 'memories', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for memories bucket
CREATE POLICY "Users can upload own memories"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'memories' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view memories"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'memories');

CREATE POLICY "Users can delete own memories"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'memories' AND (storage.foldername(name))[1] = auth.uid()::text);
</think>

<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
Read
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE important_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can manage own events" ON events
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own important_dates" ON important_dates
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own journal_entries" ON journal_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own memories" ON memories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own weight_logs" ON weight_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own kicks" ON kicks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own contractions" ON contractions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own letters" ON letters
  FOR ALL USING (auth.uid() = user_id);

-- Storage bucket for memories (create via Supabase Dashboard or run):
-- In Supabase Dashboard: Storage > New bucket > name: "memories" > Public bucket
-- Then add policy: Allow authenticated users to upload
INSERT INTO storage.buckets (id, name, public)
VALUES ('memories', 'memories', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for memories bucket
CREATE POLICY "Users can upload own memories"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'memories' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own memories"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'memories');

CREATE POLICY "Users can delete own memories"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'memories' AND (storage.foldername(name))[1] = auth.uid()::text);
