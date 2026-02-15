export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type GameStatus = "scheduled" | "live" | "final" | "postponed" | "cancelled";

export type DetectionSource = "audio" | "video" | "combined";

export type AlertType = "push" | "sms" | "email";

export type AlertStatus = "pending" | "sent" | "failed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          push_enabled: boolean;
          sms_enabled: boolean;
          email_alerts_enabled: boolean;
          max_tracked_players: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          push_enabled?: boolean;
          sms_enabled?: boolean;
          email_alerts_enabled?: boolean;
          max_tracked_players?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          push_enabled?: boolean;
          sms_enabled?: boolean;
          email_alerts_enabled?: boolean;
          max_tracked_players?: number;
          updated_at?: string;
        };
      };
      tracked_players: {
        Row: {
          id: string;
          user_id: string;
          player_name: string;
          jersey_number: number | null;
          team: string;
          position: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          player_name: string;
          jersey_number?: number | null;
          team: string;
          position?: string | null;
          created_at?: string;
        };
        Update: {
          player_name?: string;
          jersey_number?: number | null;
          team?: string;
          position?: string | null;
        };
      };
      games: {
        Row: {
          id: string;
          espn_id: string | null;
          home_team: string;
          away_team: string;
          start_time: string;
          status: GameStatus;
          broadcast: string | null;
          is_flo_college: boolean;
          stream_url: string | null;
          venue: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          espn_id?: string | null;
          home_team: string;
          away_team: string;
          start_time: string;
          status?: GameStatus;
          broadcast?: string | null;
          is_flo_college?: boolean;
          stream_url?: string | null;
          venue?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          espn_id?: string | null;
          home_team?: string;
          away_team?: string;
          start_time?: string;
          status?: GameStatus;
          broadcast?: string | null;
          is_flo_college?: boolean;
          stream_url?: string | null;
          venue?: string | null;
          updated_at?: string;
        };
      };
      detections: {
        Row: {
          id: string;
          game_id: string;
          player_name: string;
          jersey_number: number | null;
          source: DetectionSource;
          confidence: number;
          audio_confidence: number | null;
          video_confidence: number | null;
          transcript_snippet: string | null;
          frame_url: string | null;
          timestamp_in_stream: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          player_name: string;
          jersey_number?: number | null;
          source: DetectionSource;
          confidence: number;
          audio_confidence?: number | null;
          video_confidence?: number | null;
          transcript_snippet?: string | null;
          frame_url?: string | null;
          timestamp_in_stream?: number | null;
          created_at?: string;
        };
        Update: {
          confidence?: number;
          audio_confidence?: number | null;
          video_confidence?: number | null;
        };
      };
      alerts: {
        Row: {
          id: string;
          user_id: string;
          detection_id: string;
          player_name: string;
          game_id: string;
          alert_type: AlertType;
          status: AlertStatus;
          message: string;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          detection_id: string;
          player_name: string;
          game_id: string;
          alert_type: AlertType;
          status?: AlertStatus;
          message: string;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          status?: AlertStatus;
          sent_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      game_status: GameStatus;
      detection_source: DetectionSource;
      alert_type: AlertType;
      alert_status: AlertStatus;
    };
  };
}
