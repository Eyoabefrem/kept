# Kept: a CRM for people who are the whole company (Phases 2 and 3 in one zip)

| Phase | What you get | Needs |
|---|---|---|
| 1. The core (done) | Contacts, companies, deals board, tasks, dashboard, search, CSV export | Node.js |
| **2 and 3. Sync, reports, import, lead form, new landing page (this zip)** | **Email login, sync across devices, warmth map, reports, CSV import, public lead form, deploy guide** | A free Supabase project (Kept works fully on one device without it) |

## What's new

- **A new landing page built around one idea: people go cold.**
  - A wall of names, all red, slowly fading to gray. Click one to keep it warm.
  - A pinned, scroll-driven "Tuesday with Kept" where the interface animates through the day.
  - A manifesto whose words light up as you read.
  - A feature index that floods red on hover.
  - A price slider instead of three boxes.
  - A short intro counter, and a square cursor that swells over clickable things.
  Motion is reduced automatically for people who prefer it. The cursor appears only for mouse users, and the intro plays once per visit.
- **Warmth,** the same idea inside the app: a warmth map on the dashboard (one square per person) and a warmth bar on every contact.
- **Email login and sync.** Everything stays instant and works offline. When you are logged in, changes sync to your account, and Kept catches up whenever you return to the tab.
- **Reports:** revenue by month for the last year, average deal, win rate, average days to win, best clients.
- **CSV import** with a preview, duplicate skipping and automatic companies. What you export, you can import.
- **Lead capture form:** a public link (or embed) that files each visitor as a contact tagged "lead", with their message on the timeline.
- Numbers count up, pages ease in, report bars grow.

## 1. Set up Supabase (about 15 minutes)

1. Create a free project at supabase.com.
2. **SQL Editor > New query**, paste all of `supabase/schema.sql`, press **Run**. Check Table Editor for `records` and `lead_forms`.
3. **Authentication > Sign In / Providers**: make sure **Email** is enabled.
4. **Authentication > Email Templates > Magic Link**: edit the body so it contains `{{ .Token }}`, for example:

       <h2>Your Kept code</h2>
       <p>Enter this code to log in: <b>{{ .Token }}</b></p>

5. **Project Settings > API**: copy the Project URL and the **anon public** key. Never use the service_role key in this app.

## 2. Run it

    copy .env.example .env      (open .env and paste the two values)
    npm install
    npm test
    npm run dev

Restart `npm run dev` after changing `.env`. `npm test` runs two suites: the business rules (including reports, import, warmth and tracked deletes) and the sync merge rules.

## 3. Try these

1. Open the landing page. Wait for the names to fade, click a few to warm them, then scroll through the Tuesday story and watch the manifesto light up. Drag the price slider.
2. Open Kept > Dashboard > **Load sample data**. Find the warmth map: some squares are gray.
3. Open **Reports**: bars grow, best clients are listed.
4. Settings > Import: choose a CSV (try the file you export first, after adding a row). Read the preview before importing.
5. **Sync test with two windows:** log in (Settings > Log in, or /login) in both a normal and a private window with the same email. Add a contact in one. Switch to the other window: it appears. Delete it there, switch back: it is gone.
6. Edit the same contact in both windows. The most recent edit wins in both.
7. **Lead form:** Settings > Lead capture form > copy the link, open it in a private window, send a message. Back in Kept it appears in Contacts a moment later, tagged "lead", with the message on its timeline.
8. Turn the form off and reload the link: it says it is not available.

## Architecture

    kept/
    ├── index.html, vite.config.js, vercel.json, package.json, .env.example
    ├── supabase/schema.sql      records, lead_forms, the capture_lead function, security rules
    └── src/
        ├── main.jsx             routes and providers
        ├── index.css            tokens: white, black, one red, "cold" gray
        ├── lib/
        │   ├── crm.js (+test)   rules: pipeline, warmth, reports, CSV import, tracked deletes
        │   ├── sync.js (+test)  merging this device with the cloud
        │   ├── store.jsx        app state: saves locally, syncs when logged in
        │   ├── cloud.js, supabase.js, auth.jsx, sample.js, pricing.js
        ├── components/          Logo, AppShell, Modal, Forms, Cursor, CountUp, Warmth
        └── pages/               Landing, Login, Lead, Dashboard, Contacts, ContactDetail, Companies, Deals, Tasks, Reports, Settings, NotFound

### How sync works

- Every record has an `updatedAt`. When this device and the cloud both have a record, **the newer one wins**.
- A delete is saved as a small "tombstone", so something deleted on one device cannot come back from another. Deleting a contact also tombstones its notes and tasks.
- Logging in for the first time merges: what is only here is uploaded, what is only in the cloud is downloaded.
- Changes upload about a second after you make them. Coming back to the tab pulls the latest.
- The merge rules are plain functions with tests, including the "delete on one device, sync to another" story.

### How the lead form stays safe

Visitors are not logged in, so they cannot write to your tables. The form calls a database function that checks a secret token, validates the length of every field, and files the contact and note in your account. It can do nothing else.

## Deploy (free)

1. Put the project on GitHub: `git init`, `git add .`, `git commit -m "Kept"`, then create an empty repository on github.com and run the two lines it shows. The `.gitignore` keeps `.env` out.
2. vercel.com > **Add New > Project** > import it. Leave the framework as Vite.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables. Deploy.
4. Supabase > **Authentication > URL Configuration**: set the Site URL to your Vercel address.
5. On the live site, copy your lead form link again: it now uses the live address.

## Limits and honest notes

- **Sync is newest-edit-wins, per record, using each device's clock.** If two devices edit the same contact at nearly the same time, one edit is lost. A device with a very wrong clock can win unfairly.
- **The lead form has no spam protection beyond a hidden trap field and length limits.** If it is abused, turn it off in Settings.
- **New leads appear after the next sync,** which happens when you open or return to Kept.
- **Pricing on the landing page is illustrative.** The plan features are not enforced.
- **Supabase's built-in email sender** allows only a few login codes per hour. Add your own provider (Authentication > SMTP) before real traffic.
- **Tombstones are kept forever.** For a solo business this is a tiny amount of data.

## If something goes wrong

- **"Accounts are not set up yet":** `.env` is missing, misnamed, or the dev server was not restarted.
- **Email has a link but no code:** you did not edit the Magic Link template (step 4).
- **Settings says "Sync problem: ...":** copy the message. Most often the schema was not run completely.
- **The lead form says "not available":** the form is off, the link is wrong, or Supabase keys are missing.
- **A file is 0 bytes after copying:** run `Get-ChildItem -Recurse src -File | Select-Object FullName, Length`.
