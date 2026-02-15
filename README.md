# Sand on the Mound

NCAA Baseball Player Tracker - Track players in real-time during FloCollege streams and get instant alerts.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Auth, Database, Realtime)
- **PWA:** next-pwa for installable mobile experience
- **Notifications:** OneSignal (push), Twilio (SMS)
- **AI/ML:** Replicate (Whisper for audio, YOLO+OCR for video)
- **Queue:** Upstash Redis
- **Deployment:** Vercel (frontend), Render (workers)

## Getting Started

1. Clone the repository
2. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Database Setup

Run the migration scripts in order against your Supabase project:

```bash
# Using Supabase CLI
supabase db push
```

Or manually execute each file in `supabase/migrations/` in order.

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    api/auth/             # Auth callback routes
    dashboard/            # Protected dashboard pages
    login/                # Login page
    register/             # Registration page
  components/
    ui/                   # shadcn/ui components
    theme-provider.tsx    # Dark mode provider
    theme-toggle.tsx      # Dark mode toggle
  hooks/                  # Custom React hooks
  lib/
    supabase/             # Supabase client setup
    utils.ts              # Utility functions
  types/                  # TypeScript type definitions
supabase/
  migrations/             # Database migration scripts
public/
  manifest.json           # PWA manifest
  icons/                  # PWA icons
```

## Architecture

See the full architecture in the project documentation. Key phases:

1. **Foundation** - Next.js + Supabase + Auth + PWA (this setup)
2. **Data Ingestion** - ESPN schedule scraper, stream capture
3. **Detection Logic** - Audio/video analysis pipeline
4. **User Interface** - Dashboard, search, real-time alerts
