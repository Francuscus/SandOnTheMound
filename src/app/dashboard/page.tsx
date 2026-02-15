"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-supabase";
import { useRealtimeAlerts } from "@/hooks/use-realtime-alerts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Database } from "@/types/database";

type TrackedPlayer = Database["public"]["Tables"]["tracked_players"]["Row"];
type Game = Database["public"]["Tables"]["games"]["Row"];

export default function DashboardPage() {
  const { user } = useUser();
  const alerts = useRealtimeAlerts(user?.id);
  const [trackedPlayers, setTrackedPlayers] = useState<TrackedPlayer[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [playersResult, gamesResult] = await Promise.all([
        supabase
          .from("tracked_players")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("games")
          .select("*")
          .in("status", ["scheduled", "live"])
          .order("start_time", { ascending: true })
          .limit(10),
      ]);

      if (playersResult.data) setTrackedPlayers(playersResult.data);
      if (gamesResult.data) setGames(gamesResult.data);
    };

    fetchData();
  }, [user, supabase]);

  async function handleTrackPlayer(name: string, team: string) {
    if (!user) return;

    const { data, error } = await supabase
      .from("tracked_players")
      .insert({ user_id: user.id, player_name: name, team })
      .select()
      .single();

    if (data && !error) {
      setTrackedPlayers((prev) => [data, ...prev]);
    }
  }

  async function handleUntrackPlayer(id: string) {
    await supabase.from("tracked_players").delete().eq("id", id);
    setTrackedPlayers((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Track your players and get real-time alerts
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Today's Games */}
            <Card className="col-span-full lg:col-span-2">
              <CardHeader>
                <CardTitle>Today&apos;s Games</CardTitle>
                <CardDescription>
                  Live and upcoming FloCollege games
                </CardDescription>
              </CardHeader>
              <CardContent>
                {games.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No games scheduled. Check back later.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {games.map((game) => (
                      <div
                        key={game.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">
                            {game.away_team} @ {game.home_team}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(game.start_time).toLocaleString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            game.status === "live" ? "default" : "secondary"
                          }
                        >
                          {game.status === "live" ? "LIVE" : game.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tracked Players Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Tracked Players</CardTitle>
                <CardDescription>
                  {trackedPlayers.length}/10 players tracked
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trackedPlayers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No players tracked yet. Search and add players below.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {trackedPlayers.slice(0, 5).map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>
                          {player.player_name}
                          {player.jersey_number
                            ? ` #${player.jersey_number}`
                            : ""}
                        </span>
                        <Badge variant="outline">{player.team}</Badge>
                      </div>
                    ))}
                    {trackedPlayers.length > 5 && (
                      <p className="text-xs text-muted-foreground">
                        +{trackedPlayers.length - 5} more
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>
                Real-time notifications from your tracked players
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No alerts yet. Alerts will appear here when your tracked
                  players are detected in live streams.
                </p>
              ) : (
                <div className="space-y-3">
                  {alerts.slice(0, 10).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{alert.player_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {alert.message}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            alert.status === "sent" ? "default" : "secondary"
                          }
                        >
                          {alert.alert_type}
                        </Badge>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(alert.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="players" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Players</CardTitle>
              <CardDescription>
                Search by name, team, or jersey number
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button>Search</Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Player search will be available once the player database is
                seeded. Start with Rutgers roster.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Tracked Players</CardTitle>
              <CardDescription>
                {trackedPlayers.length}/10 slots used
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trackedPlayers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You haven&apos;t tracked any players yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {trackedPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">
                          {player.player_name}
                          {player.jersey_number
                            ? ` #${player.jersey_number}`
                            : ""}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {player.team}
                          {player.position ? ` - ${player.position}` : ""}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleUntrackPlayer(player.id)}
                      >
                        Untrack
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Alerts</CardTitle>
              <CardDescription>
                Complete history of player detection alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No alerts yet. Start tracking players and alerts will appear
                  here during live games.
                </p>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{alert.player_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {alert.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          alert.status === "sent"
                            ? "default"
                            : alert.status === "failed"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {alert.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
