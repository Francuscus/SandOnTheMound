-- Analytics tables for monitoring
CREATE TABLE public.analytics_detections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    player_id UUID,
    game_id UUID REFERENCES public.games(id) ON DELETE SET NULL,
    detection_count INTEGER DEFAULT 0,
    avg_confidence FLOAT DEFAULT 0,
    UNIQUE(date, player_id, game_id)
);

CREATE TABLE public.analytics_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    type TEXT NOT NULL,
    count INTEGER DEFAULT 0,
    success_rate FLOAT DEFAULT 0,
    UNIQUE(date, type)
);

-- Enable RLS
ALTER TABLE public.analytics_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_alerts ENABLE ROW LEVEL SECURITY;

-- Service role only access for analytics
CREATE POLICY "Service role can manage detection analytics"
    ON public.analytics_detections FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role can manage alert analytics"
    ON public.analytics_alerts FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Authenticated users can read analytics
CREATE POLICY "Authenticated users can view detection analytics"
    ON public.analytics_detections FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can view alert analytics"
    ON public.analytics_alerts FOR SELECT
    TO authenticated
    USING (true);
