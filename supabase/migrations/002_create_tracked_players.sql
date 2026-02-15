-- Create tracked players table
CREATE TABLE public.tracked_players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    player_name TEXT NOT NULL,
    jersey_number INTEGER,
    team TEXT NOT NULL,
    position TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    -- Prevent duplicate tracking of same player by same user
    UNIQUE(user_id, player_name, team)
);

-- Enable RLS
ALTER TABLE public.tracked_players ENABLE ROW LEVEL SECURITY;

-- Users can only view their own tracked players
CREATE POLICY "Users can view own tracked players"
    ON public.tracked_players FOR SELECT
    USING (auth.uid() = user_id);

-- Users can add tracked players
CREATE POLICY "Users can add tracked players"
    ON public.tracked_players FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can remove their own tracked players
CREATE POLICY "Users can remove own tracked players"
    ON public.tracked_players FOR DELETE
    USING (auth.uid() = user_id);

-- Index for fast lookups by user
CREATE INDEX idx_tracked_players_user_id ON public.tracked_players(user_id);

-- Index for finding all users tracking a specific player (used by alert system)
CREATE INDEX idx_tracked_players_player_name ON public.tracked_players(player_name, team);
