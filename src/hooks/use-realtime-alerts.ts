"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Alert = Database["public"]["Tables"]["alerts"]["Row"];

export function useRealtimeAlerts(userId: string | undefined) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;

    // Fetch initial alerts
    const fetchAlerts = async () => {
      const { data } = await supabase
        .from("alerts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) setAlerts(data);
    };

    fetchAlerts();

    // Subscribe to new alerts
    const channel = supabase
      .channel("alerts-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "alerts",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setAlerts((prev) => [payload.new as Alert, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  return alerts;
}
