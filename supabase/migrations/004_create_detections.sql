-- Create detection source enum
CREATE TYPE public.detection_source AS ENUM ('audio', 'video', 'combined');

-- Create detections table
CREATE TABLE public.detections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
    player_name TEXT NOT NULL,
    jersey_number INTEGER,
    source public.detection_source NOT NULL,
    confidence FLOAT NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    audio_confidence FLOAT CHECK (audio_confidence >= 0 AND audio_confidence <= 1),
    video_confidence FLOAT CHECK (video_confidence >= 0 AND video_confidence <= 1),
    transcript_snippet TEXT,
    frame_url TEXT,
    timestamp_in_stream INTEGER, -- seconds from stream start
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.detections ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view detections for games they care about
CREATE POLICY "Authenticated users can view detections"
    ON public.detections FOR SELECT
    TO authenticated
    USING (true);

-- Only service role can insert detections (worker service)
CREATE POLICY "Service role can manage detections"
    ON public.detections FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Indexes for detection queries
CREATE INDEX idx_detections_game_id ON public.detections(game_id);
CREATE INDEX idx_detections_player ON public.detections(player_name);
CREATE INDEX idx_detections_confidence ON public.detections(confidence) WHERE confidence >= 0.8;
CREATE INDEX idx_detections_created_at ON public.detections(created_at);
