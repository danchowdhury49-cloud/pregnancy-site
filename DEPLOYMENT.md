# Pregnancy Tracker - Deployment Instructions

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Vercel account (for deployment)

---

## 1. Local Setup

### Install Dependencies

```bash
cd "c:\Users\danch\Documents\Cursor\Pregnancy Site"
npm install
```

### Environment Variables

Create a `.env.local` file (copy from `.env.example`):

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials (see step 2).

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 2. Supabase Setup

### Create a Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Name it (e.g., "pregnancy-tracker")
4. Set a database password (save it securely)
5. Choose a region
6. Click **Create project**

### Get API Keys

1. In your Supabase project, go to **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Create Tables

1. Go to **SQL Editor**
2. Create a new query
3. Paste the contents of `supabase/schema.sql`
4. Click **Run**

### Create Storage Bucket (if not auto-created)

1. Go to **Storage**
2. Click **New bucket**
3. Name: `memories`
4. Enable **Public bucket** (for image display)
5. Click **Create**

### Storage Policies

In **Storage** → **Policies** for `memories`:

- **INSERT**: Allow authenticated users to upload (with path check: `auth.uid()/...`)
- **SELECT**: Allow authenticated users to read
- **DELETE**: Allow authenticated users to delete their own files

Or run the storage policy SQL from `supabase/schema.sql` if the bucket exists.

### Enable Email Auth

1. Go to **Authentication** → **Providers**
2. Email is enabled by default
3. Optional: Configure **Email templates** (confirm signup, reset password)

---

## 3. Vercel Deployment

### Connect Repository

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click **Add New** → **Project**
4. Import your repository

### Environment Variables (Vercel)

In **Project Settings** → **Environment Variables**, add:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | Production, Preview, Development |
| `NEXT_PUBLIC_DUE_DATE` | YYYY-MM-DD (e.g. 2025-06-15) | Production, Preview, Development |

### Deploy

1. Click **Deploy**
2. Wait for the build to complete

---

## 4. Post-Deploy

### Supabase Auth Redirect URLs

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Redirect URLs** (e.g. `https://your-app.vercel.app/**`)

---

## 5. Running Locally

```bash
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_DUE_DATE=2025-06-15
```

```bash
npm run dev
```

---

## Troubleshooting

### "Invalid API key"
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- No extra spaces or quotes

### "Row Level Security policy violation"
- RLS is enabled; ensure the user is authenticated
- Check that `user_id` is set correctly (via Supabase auth triggers if needed)

### Images not loading
- Storage bucket `memories` must be **Public**
- Check Supabase Storage policies for SELECT

### Due date wrong
- Set `NEXT_PUBLIC_DUE_DATE` in format `YYYY-MM-DD`
- If unset, defaults to 140 days from now
