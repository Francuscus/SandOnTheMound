-- Create alert enums
CREATE TYPE public.alert_type AS ENUM ('push', 'sms', 'email');
CREATE TYPE public.alert_status AS ENUM ('pending', 'sent', 'failed');

-- Create alerts table
CREATE TABLE public.alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    detection_id UUID REFERENCES public.detections(id) ON DELETE CASCADE NOT NULL,
    player_name TEXT NOT NULL,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
    alert_type public.alert_type NOT NULL,
    status public.alert_status DEFAULT 'pending' NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Users can only view their own alerts
CREATE POLICY "Users can view own alerts"
    ON public.alerts FOR SELECT
    USING (auth.uid() = user_id);

-- Service role can manage all alerts
CREATE POLICY "Service role can manage alerts"
    ON public.alerts FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Indexes for alert queries
CREATE INDEX idx_alerts_user_id ON public.alerts(user_id);
CREATE INDEX idx_alerts_detection_id ON public.alerts(detection_id);
CREATE INDEX idx_alerts_created_at ON public.alerts(created_at);
CREATE INDEX idx_alerts_status ON public.alerts(status);

-- Enable realtime for alerts table
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
