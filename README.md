# Kept

> **A quiet, local-first CRM for solo businesses.**  
> Contacts, deals, tasks, and follow-ups in one place — designed around one core truth: *people go cold*.

Kept is built for people who are the whole company: freelancers, consultants, agency founders, and independent operators. No bloated enterprise workflows, no sales-team permissions, and no recurring software subscriptions required. Just a fast, disciplined tool to know your clients, keep relationships warm, and close deals.

Built with Swiss design principles — white paper, black ink, hairline rules, strict typography, and a single signature red (`#e30613`).

---

## Highlights

- **Local-First & Instant**: Zero signup required to start. Everything runs offline in your browser using `localStorage`. Instant loads, zero network latency.
- **Warmth Tracking**: Visual relationship indicators and an interactive dashboard warmth map. Kept tracks time since your last touchpoint (call, email, meeting, note) and highlights fading relationships before clients go cold.
- **Visual Deal Pipeline**: Minimalist Kanban board across standard lifecycle stages (`Lead` → `Contacted` → `Proposal` → `Negotiation` → `Won` / `Lost`). Automatically tracks close dates and pipeline velocity.
- **Context-Aware Tasks**: Unified task system organized into actionable buckets (`Overdue`, `Today`, `Upcoming`, `Someday`) linked directly to contacts and deals.
- **Analytics & Reports**: Visual revenue reporting for the trailing 12 months, win rate percentage, average deal size, average days to win, and ranking of your top clients.
- **Public Lead Capture Form**: Shareable standalone link (`/lead?f=<token>`) or embeddable widget. Inbound leads are safely validated and filed directly into your CRM with a timestamped note via PostgreSQL RPC.
- **Optional Multi-Device Cloud Sync**: Connect a free Supabase project for passwordless email login (magic link / OTP) and automatic bi-directional sync across all your devices.
- **Data Sovereignty & Portability**: Full CSV import with live preview and duplicate detection, plus single-click CSV export anytime.

---

## The Core Concept: Warmth

Most CRMs are databases of dead contacts. Kept is built around **warmth**:

1. Every touchpoint you log (a call, note, email, or meeting) resets a contact's warmth to 100%.
2. Over time, each contact's warmth indicator slowly decays toward gray based on your configurable follow-up threshold (e.g. 30 days).
3. The dashboard displays an interactive warmth grid where every client is represented by a tile. When squares turn gray, Kept reminds you who needs a conversation before the relationship slips away.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/) |
| **Routing** | [React Router v6](https://reactrouter.com/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + CSS Variables (`var(--paper)`, `var(--ink)`, `var(--red)`) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) (with automatic `prefers-reduced-motion` support) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Typography** | [Inter Tight](https://fonts.google.com/specimen/Inter+Tight) |
| **Backend / Sync** *(Optional)* | [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, RPC Functions, Magic Link Auth) |
| **Testing** | Native Node.js test runner (`node:assert`) |

---

## Quickstart

### 1. Run Locally (Zero Config)

Kept works fully on your machine without any external accounts or API keys:

```bash
# Clone the repository
git clone https://github.com/your-username/kept.git
cd kept

# Install dependencies
npm install

# Run test suites
npm test

# Start local development server
npm run dev
```

Open `http://localhost:5173` in your browser. You can click **"Load sample data"** in the dashboard to immediately explore the interface.

---

### 2. Optional: Enable Cloud Sync & Lead Capture (Supabase)

To enable email login, multi-device sync, and public lead capture, connect a free Supabase project:

1. **Create a project**: Sign up for free at [supabase.com](https://supabase.com) and create a new project.
2. **Apply the schema**:
   - In your Supabase dashboard, navigate to **SQL Editor > New query**.
   - Paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
   - Verify in the **Table Editor** that `records` and `lead_forms` tables are created.
3. **Configure Authentication**:
   - Go to **Authentication > Providers > Email** and ensure Email sign-in is enabled.
   - Go to **Authentication > Email Templates > Magic Link**, and ensure the template includes `{{ .Token }}`:
     ```html
     <h2>Your Kept Login Code</h2>
     <p>Enter this verification code to log in: <b>{{ .Token }}</b></p>
     ```
4. **Set Environment Variables**:
   - In Supabase, go to **Project Settings > API**.
   - Copy the **Project URL** and the **anon public** key (never use the `service_role` key in frontend code).
   - In your Kept folder, create `.env` from `.env.example`:
     ```env
     VITE_SUPABASE_URL=https://your-project-id.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-public-key
     ```
   - Restart the dev server (`npm run dev`).

---

## Project Structure

```text
kept/
├── index.html               # App entrypoint, theme bootstrap, Inter Tight font
├── vite.config.js           # Vite configuration with React and Tailwind CSS v4 plugins
├── vercel.json              # SPA routing rewrites for Vercel deployment
├── supabase/
│   └── schema.sql           # Database schema, RLS policies, and lead capture RPC function
└── src/
    ├── main.jsx             # React entrypoint, routing, and provider configuration
    ├── index.css            # Swiss design tokens, color palette, custom utilities
    ├── components/
    │   ├── AppShell.jsx     # Navigation sidebar, global search shortcut (⌘K / Ctrl+K)
    │   ├── Warmth.jsx       # Warmth bar, warmth tile grid, and status indicators
    │   ├── Forms.jsx        # Standardized inputs, entity creation, and edit sheets
    │   ├── Modal.jsx        # Accessible dialog wrapper
    │   ├── CountUp.jsx      # Animated tabular numeral transitions
    │   ├── Cursor.jsx       # Interactive precision pointer
    │   └── Logo.jsx         # Minimal geometric wordmark
    ├── lib/
    │   ├── crm.js           # Pure business logic: pipeline, warmth decay, reports, CSV engine
    │   ├── crm.test.js      # Unit tests for CRM calculations and transformations
    │   ├── sync.js          # Sync engine: merge algorithm, record flattening, conflict resolution
    │   ├── sync.test.js     # Unit tests for bidirectional sync and tombstone propagation
    │   ├── store.jsx        # Unified app state provider: local-first persistence + sync coordinator
    │   ├── cloud.js         # Supabase client queries with error boundaries
    │   ├── supabase.js      # Supabase client instantiation
    │   ├── auth.jsx         # Session state, OTP submission, and sign-out logic
    │   ├── sample.js        # Realistic seed dataset for instant onboarding
    │   └── pricing.js       # Plan definitions
    └── pages/
        ├── Landing.jsx      # Interactive landing page with warmth simulator & live demo
        ├── Dashboard.jsx    # Overview metrics, upcoming tasks, stale contact alerts, warmth map
        ├── Contacts.jsx     # Contact directory, search, filtering, and tag management
        ├── ContactDetail.jsx# Full client profile: contact metadata, deals, notes, and activity timeline
        ├── Companies.jsx    # Organization directory linked to associated contacts and deals
        ├── Deals.jsx        # Kanban stage pipeline with deal values and stage progression
        ├── Tasks.jsx        # Categorized task manager with due-date classification
        ├── Reports.jsx      # Trailing 12-month revenue chart, win rates, and top customer tables
        ├── Lead.jsx         # Public standalone lead capture form (`/lead?f=<token>`)
        ├── Login.jsx        # Passwordless email verification login view
        ├── Settings.jsx     # Data import/export, lead form configuration, currency, dark mode
        └── NotFound.jsx     # 404 fallback page
```

---

## How Sync Works

Kept follows an **offline-first, newest-wins (LWW)** architecture:

1. **Local-First**: Every mutation writes synchronously to `localStorage`. The app never waits for the network to render state updates.
2. **Deterministic Merge**: Every record contains an `updatedAt` millisecond timestamp. When local and remote states are synchronized, the record with the newer timestamp takes precedence.
3. **Deletion Tombstones**: Deleting an entity creates a lightweight tombstone record (`deleted: true`). This prevents a deleted contact on one device from being resurrected by an offline device during sync. Deleting a contact automatically cascades tombstones to its linked tasks and activities.
4. **Background Reconciliation**:
   - Sync triggers automatically upon logging in.
   - Local changes are debounced (~900ms) before being pushed to Supabase.
   - Returning to the application tab (`visibilitychange`) automatically pulls incoming updates.

### Lead Capture Security

Public visitors submitting the lead capture form cannot read or directly insert into your database tables. Instead, submissions invoke a PostgreSQL stored procedure (`capture_lead`) marked `SECURITY DEFINER`:

- Validates that the form token exists and is active.
- Enforces strict character-length limits on names, emails, and message contents.
- Automatically encapsulates the submission into a contact tagged `lead` along with an activity note on the contact's timeline.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite local development server on port 5173 |
| `npm run build` | Builds optimized production static assets into `dist/` |
| `npm run preview` | Previews the production build locally |
| `npm test` | Executes both `crm.test.js` and `sync.test.js` unit test suites |

---

## Deployment

Because Kept is a static Single Page Application (SPA), it can be deployed to any modern web host in seconds.

### Deploying to Vercel

1. Push your repository to GitHub.
2. In [Vercel](https://vercel.com), select **Add New > Project** and import your repository.
3. Framework preset will automatically detect **Vite**.
4. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**.
6. In Supabase, update **Authentication > URL Configuration > Site URL** to your production Vercel domain.

*Note: [`vercel.json`](vercel.json) is pre-configured with client-side SPA route rewrites.*

---

## Design System & Accessibility

- **Swiss Minimalist Palette**: Strict contrast ratios using `--paper`, `--ink`, `--muted`, and `--red`.
- **Light & Dark Themes**: First-class dark mode support toggled in Settings or automatically inherited via system preference.
- **Accessibility & Motion**: Complies with `prefers-reduced-motion` to disable non-essential animations. Custom cursor effects only activate for pointer devices with hover capability.
- **Fast Keyboard Navigation**: Global search shortcut (`⌘K` / `Ctrl+K`) to jump directly to any contact, company, or deal.

---

## License

MIT License. Free to use, modify, and self-host for your business.
