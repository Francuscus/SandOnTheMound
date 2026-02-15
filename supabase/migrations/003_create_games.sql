-- Create game status enum
CREATE TYPE public.game_status AS ENUM ('scheduled', 'live', 'final', 'postponed', 'cancelled');

-- Create games table
CREATE TABLE public.games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    espn_id TEXT UNIQUE,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    status public.game_status DEFAULT 'scheduled' NOT NULL,
    broadcast TEXT,
    is_flo_college BOOLEAN DEFAULT false,
    stream_url TEXT,
    venue TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS (games are publicly readable)
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view games
CREATE POLICY "Authenticated users can view games"
    ON public.games FOR SELECT
    TO authenticated
    USING (true);

-- Only service role can insert/update games (cron job)
CREATE POLICY "Service role can manage games"
    ON public.games FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Indexes for common queries
CREATE INDEX idx_games_start_time ON public.games(start_time);
CREATE INDEX idx_games_status ON public.games(status);
CREATE INDEX idx_games_flo_college ON public.games(is_flo_college) WHERE is_flo_college = true;
CREATE INDEX idx_games_teams ON public.games(home_team, away_team);

-- Auto-update updated_at
CREATE TRIGGER games_updated_at
    BEFORE UPDATE ON public.games
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
