# PowerLog

Mobile-first web app for electricians to manage site materials, track required vs used quantities, create daily work reports, and share via WhatsApp / PDF. Company admins can track their electrician team.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **Supabase** — Google Auth, Postgres, RLS, Storage
- **Vercel** — hosting

## Roles

| Role | Access |
|------|--------|
| **Admin** | Create company, invite code, see all sites/reports/team |
| **Electrician** | Create sites, materials, daily reports, share |

## Setup

### 1. Install

```bash
npm install
cp .env.example .env.local
```

### 2. Supabase project

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL migration in the SQL Editor:
   - Open [`supabase/migrations/20260314120000_init.sql`](supabase/migrations/20260314120000_init.sql)
   - Paste and run it in the Supabase SQL Editor
3. **Auth → Providers → Google**: enable and add Google Client ID/Secret
4. **Auth → URL Configuration**: add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://YOUR_VERCEL_DOMAIN/auth/callback`

### 3. Environment variables

`.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

On Vercel, set the same vars (with `NEXT_PUBLIC_APP_URL` = your production URL).

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Deploy to Vercel

1. Push this repo to GitHub
2. Import in Vercel
3. Add env vars
4. Deploy

## First-use flow

1. Sign in with Google  
2. **Create Company** (you become admin) **or** **Join with invite code** (electrician)  
3. Admin shares invite code from Admin → Team / Settings  
4. Electrician: New Site → Add Materials → Daily Report → Share (WhatsApp / PDF)

## Core routes

- `/app` — electrician dashboard  
- `/app/sites/new` — create site  
- `/app/sites/[id]` — materials + reports  
- `/app/library` — item library CRUD  
- `/admin` — company overview  

## Notes

- Custom items/work can be saved into the company library  
- Remaining qty = required − used (auto)  
- Photos upload to Supabase Storage bucket `report-photos`
