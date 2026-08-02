# Fishers Restaurant Group — Website

Static site (3 locations: Leith, City, Shore Bar) with menu items pulled live
from Sanity CMS. Code lives on GitHub; the live site is hosted on Vercel and
redeploys automatically on every push to `main`.

## How the pieces fit together

- **The website** (`index.html`, `leith.html`, `city.html`, `shore.html`,
  `assets/`) is plain HTML/CSS/JS — no build step. Vercel serves it as-is.
- **The menu** on each page is wired to fetch live data from Sanity
  (`assets/sanity-menu.js`) at page-load time, straight from the browser. If
  Sanity has no items for a given course, or is unreachable, the static menu
  already in the HTML is shown instead — the site never breaks.
- **Sanity Studio** (`studio/`) is the admin tool where staff edit menu items.
  It's deployed separately (to Sanity's own free hosting), not through Vercel.
- **Editing menu content never requires a GitHub push or a Vercel deploy.**
  GitHub → Vercel is only for changes to the site's design/code.

```
Staff edits menu in Sanity Studio ──► sanity.io API ──► live site (fetches on page load)
You edit site code ──► git push ──► GitHub ──► Vercel auto-deploy
```

## One-time setup

### 1. Push this repo to GitHub

```
cd ~/Downloads/Fishers-2
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

(Create the empty repo first at github.com/new — don't initialize it with a
README or .gitignore, since this folder already has both.)

### 2. Connect Vercel

1. Go to vercel.com/new and import the GitHub repo you just pushed.
2. Framework Preset: **Other** (it's a static site — no build command needed).
3. Root Directory: leave as `./` (the repo root, *not* `studio`).
4. Deploy. You'll get a `*.vercel.app` URL immediately; add your real domain
   under Project → Settings → Domains whenever you're ready.

From now on, every `git push` to `main` redeploys the live site automatically
— that's your "confirm it looks right" loop for design/code changes.

### 3. Deploy Sanity Studio

```
cd ~/Downloads/Fishers-2/studio
npm install
npx sanity login
npx sanity deploy
```

`sanity deploy` will ask for a studio hostname (e.g. `fishers-menu`) and give
you a URL like `https://fishers-menu.sanity.studio` — that's the login page
staff will use to edit the menu.

This assumes the Sanity project ID already baked into the code
(`4ut45eec`, dataset `fishers_menu`) is one you have access to. If `sanity
login` puts you on an account that can't see that project, run
`npx sanity init` instead, choose "create new project," and then update the
project ID in three places before deploying: `studio/sanity.config.js`,
`studio/sanity.cli.js`, and the `PROJECT_ID` variable near the top of
`assets/sanity-menu.js`. Commit and push that change so the live site points
at the right project.

To give an employee access to the Studio without giving them your login:
sanity.io/manage → your project → Members → Invite, and add them as
"Editor" (they can add/edit/publish content but not change project settings
or billing).

### 4. Verify end-to-end

1. Open the Vercel URL — all three menu pages should look exactly like they
   do today (Sanity has no entries yet, so the static fallback shows).
2. In Sanity Studio, add one test item to any course (e.g. a Leith starter)
   and hit Publish.
3. Refresh the live site — that item should now appear, replacing the static
   list for that course. This confirms the whole pipeline works before staff
   start relying on it.
4. Delete or unpublish the test item once confirmed.

## Adding real menu content

Each location has its own document type in Studio (Menu Item — Leith / City
— Shore Bar). For each item, choose the **Course** from the dropdown — this
determines which section of the page it shows up in. A few courses on the
City page are split into `Fishers Favourites` and `Shellfish Specials`
sub-lists (kitchen/grill, surf & turf) — pick the matching sub-course.

Once **any** item exists for a course, it fully replaces the static
placeholder items for that course — so a course should either be left empty
(static menu shows) or filled in completely (don't mix static-only pricing
changes with partial Sanity entries).

Toggle **Available** off to 86 an item without deleting it (e.g. seasonal or
sold out) — it disappears from the site immediately, no redeploy needed.

**Not editable via Sanity** (left as static HTML by design, since they're
one-off formatted specials rather than simple name/price/description
listings): the Leith steak cuts & "for the table" block, the City "Pacific
Rock Oysters" four-ways listing, and the City "Orkney Scallops" (Shellfish
Specials) serving options. Changing prices in those requires editing the
HTML directly and pushing to GitHub.
