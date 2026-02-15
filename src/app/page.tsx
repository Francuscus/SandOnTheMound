import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-xl font-bold">Sand on the Mound</h1>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
        <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Never Miss Your Player&apos;s Moment
          </h2>
          <p className="text-lg text-muted-foreground">
            Track NCAA baseball players in real-time during FloCollege streams.
            Get instant push notifications when your tracked players appear on
            the mound, at bat, or making plays.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/register">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Sign In
            </Button>
          </Link>
        </div>
        <div className="mt-8 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-lg border p-6">
            <h3 className="mb-2 font-semibold">Real-Time Detection</h3>
            <p className="text-sm text-muted-foreground">
              Audio transcription and video analysis detect when your player
              appears in the stream.
            </p>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="mb-2 font-semibold">Instant Alerts</h3>
            <p className="text-sm text-muted-foreground">
              Push notifications sent directly to your phone within seconds of
              detection.
            </p>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="mb-2 font-semibold">Track Multiple Players</h3>
            <p className="text-sm text-muted-foreground">
              Follow up to 10 players across different teams and games
              simultaneously.
            </p>
          </div>
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          Sand on the Mound &mdash; NCAA Baseball Player Tracker
        </div>
      </footer>
    </div>
  );
}
