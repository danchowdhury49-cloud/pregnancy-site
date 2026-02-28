# Pregnancy Tracker

A private, minimal, elegant pregnancy tracker web app for expecting parents.

## Features

- **Authentication** – Supabase email/password auth
- **Home Dashboard** – Current week, countdown, baby size, next event, journal preview
- **Calendar** – Monthly view, doctor appointments, milestones, custom events
- **Important Dates** – First ultrasound, baby shower, gender reveal, custom dates
- **Journal** – Weekly reflections with mood and optional symptoms
- **Memories** – Photo gallery with captions
- **Health** – Weight tracking, kick counter, contraction timer
- **Letters to Baby** – Private letters for your little one

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth, Database, Storage)
- Recharts (weight chart)
- date-fns

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Run the SQL in `supabase/schema.sql` in the SQL Editor
   - Create a `memories` storage bucket (public) if not auto-created

3. **Environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Supabase URL, anon key, and due date.

4. **Run locally**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Vercel and Supabase setup instructions.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `NEXT_PUBLIC_DUE_DATE` | Due date (YYYY-MM-DD). Defaults to 140 days from now if unset |
