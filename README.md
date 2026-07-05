# Vertexia CRM

A production-ready CRM for Vertexia — a Karachi-based web development agency selling small-business websites. Manage leads, track call activity, generate AI cold-calling scripts, and convert leads to clients.

**Stack:** Next.js 16 · TypeScript · Tailwind CSS · Supabase · Google Gemini AI

---

## Features

- **Lead management** — add, edit, filter leads by pipeline status (New → Contacted → Follow Up → Won → Lost)
- **Call logging** — log every call attempt with outcome + notes; auto-incremented call counter badge on every lead
- **AI call scripts** — generate personalized Gatekeeper + Owner scripts per lead using Google Gemini (free tier), versioned history
- **WhatsApp button** — one-click `wa.me` deep link opens a pre-filled chat (see limitation note below)
- **Client conversion** — "Mark as Won" converts a lead to a Client record with plan/contract/payment fields
- **Dashboard** — real-time pipeline funnel, call stats, recent activity feed
- **Auth** — Supabase email+password, Row Level Security, sales_rep / admin roles

---

## Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) account and project
- A free [Google AI Studio](https://aistudio.google.com) API key (for Gemini)

---

## 1. Clone & Install

```bash
git clone <your-repo-url>
cd vertexia-crm
npm install
```

---

## 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Note your **Project URL** and **anon public key** from **Settings → API**
3. Also copy the **service_role key** (keep it secret — never expose to browser)

### Run the database migration

In your Supabase dashboard → **SQL Editor** → paste the entire contents of:

```
supabase/migrations/001_initial_schema.sql
```

Click **Run**. This creates all tables (`leads`, `call_logs`, `scripts`, `clients`, `profiles`), indexes, RLS policies, and helper views.

### (Optional) Load seed data

After creating your first user account (sign up at `/signup`), paste and run:

```
supabase/seed.sql
```

This loads 10 realistic Karachi-based sample leads across varied industries so the app is demo-able immediately.

---

## 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
Copy-Item .env.example .env.local   # Windows PowerShell
# or
cp .env.example .env.local          # bash/macOS
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

AI_PROVIDER=gemini
AI_API_KEY=your-gemini-api-key-here
AI_MODEL=gemini-flash-latest
```

### Getting a free Gemini API key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with a Google account
3. Click **Get API key** → **Create API key**
4. Copy the key into `AI_API_KEY`

`gemini-flash-latest` always points to the latest free Flash model — no version pinning needed.

### Using OpenRouter instead (optional)

```env
AI_PROVIDER=openrouter
AI_API_KEY=your-openrouter-key
AI_MODEL=google/gemini-2.0-flash-001
```

---

## 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up for an account, then load the seed data if you haven't.

---

## 5. Deploy to Vercel

1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo
3. In **Environment Variables**, add all keys from `.env.local`
4. Deploy — Vercel auto-detects Next.js

> **Important:** The `SUPABASE_SERVICE_ROLE_KEY` is server-only. It is safe on Vercel (never sent to browser) but never commit it to source control.

---

## WhatsApp Integration — Important Limitation

The "Open WhatsApp Chat" button uses a `https://wa.me/<number>?text=<message>` deep link.

**What it does:** Opens WhatsApp (mobile app or WhatsApp Web) with a chat window pre-filled with a greeting message. The sales rep then taps the **call icon inside WhatsApp** themselves to start the voice call.

**What it does NOT do:** It does not auto-dial a call. WhatsApp has no free/public API to programmatically start a voice call from a web app.

> **Phase 2 (not built):** WhatsApp Business Cloud API click-to-call templates — requires a paid Meta Business account. Documented here as a future upgrade path.

---

## Project Structure

```
vertexia-crm/
├── app/
│   ├── (auth)/            # Login + signup pages
│   ├── (dashboard)/       # Protected app routes
│   │   ├── dashboard/     # Dashboard home
│   │   ├── leads/         # Leads list, [id] detail, [id]/edit
│   │   ├── clients/       # Clients list, [id] detail
│   │   └── settings/      # Settings + team management
│   └── api/
│       └── generate-scripts/  # AI script generation endpoint
├── components/
│   ├── layout/            # Sidebar, TopNav
│   ├── leads/             # LeadTable, LeadForm, CallLogForm, CallTimeline,
│   │                      # ScriptsPanel, WhatsAppButton, MarkWonModal, MarkLostButton
│   └── clients/           # ClientEditForm
├── lib/
│   ├── supabase/          # client.ts, server.ts, admin.ts
│   ├── ai/                # provider.ts (Gemini + OpenRouter)
│   ├── actions/           # leads.ts, call-logs.ts, clients.ts (Server Actions)
│   └── utils.ts           # Shared utilities
├── supabase/
│   ├── migrations/        # 001_initial_schema.sql
│   └── seed.sql           # 10 sample Karachi leads
├── types/
│   └── database.ts        # TypeScript types for all DB tables
├── proxy.ts               # Auth proxy (Next.js 16 convention)
└── .env.example           # Environment variable template
```

---

## AI Script Generation

The `POST /api/generate-scripts` endpoint:

1. Authenticates the user via Supabase session
2. Fetches the lead's `business_name`, `industry`, `city`, `current_website_status`, `contact_role`, `notes`
3. Sends a structured prompt to the configured AI provider
4. Returns and saves two scripts: **Gatekeeper** (get past reception) + **Owner/Decision-Maker** (sales pitch)
5. Scripts are versioned — regenerate anytime, history is preserved

The prompt instructs the AI to reference Vertexia's actual offer (Rs. 22,000, 7-day delivery, domain+hosting+email, 30-day guarantee) and tailor language to the lead's specific industry.

---

## Database Schema

| Table | Purpose |
|---|---|
| `profiles` | Extends Supabase auth.users with name + role |
| `leads` | Core lead records with status pipeline |
| `call_logs` | Every call attempt, auto-numbered per lead |
| `scripts` | AI-generated scripts, versioned per lead |
| `clients` | Converted leads with contract/payment details |
| `leads_with_call_info` | View: leads + computed call_count, last_call_at, last_call_outcome |

---

## Assumptions & Design Decisions

- **Single tenant:** All reps share one Supabase project. RLS allows reps to see unassigned or their own leads; admins see everything.
- **Admin role:** Granted manually in Supabase Table Editor (`profiles.role = 'admin'`). First user must self-promote or be set by the project owner.
- **AI cost:** `gemini-flash-latest` is free at ~1,500 requests/day. For a small team of 2–10, this is more than sufficient.
- **No real-time:** The app uses server-rendered data. After logging a call or generating scripts, the page refreshes to show updated data. TanStack Query is installed for future client-side real-time needs.
- **WhatsApp number format:** Enter with country code, no spaces or dashes (e.g. `+923211234567`). The app normalizes it before building the `wa.me` link.

---

## Known Issues / TODOs

- [ ] **Kanban view** for leads list (table view is complete; kanban is a drag-and-drop enhancement)
- [ ] **Search** refreshes full page (server-rendered GET form) — could be upgraded to client-side filtering with TanStack Query
- [ ] **Assigned_to filter** — leads can be assigned to a rep but the filter UI for "My leads" isn't built yet
- [ ] **Admin role promotion** — currently requires direct Supabase Table Editor access; a UI would be better
- [ ] **Email notifications** — callback reminders, follow-up nudges (Phase 2)
- [ ] **WhatsApp Business Cloud API** — click-to-call templates (Phase 2, requires paid Meta account)
- [ ] **Script regeneration** does a full page reload after generation; could be optimistic UI with TanStack Query

---

## License

Private / internal tool. Not licensed for public distribution.
