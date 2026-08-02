# Fishers Restaurant Group — Website

Static site (3 locations: Leith, City, Shore Bar) with menu items pulled live
from Sanity CMS. Code lives on GitHub; the live site is hosted on Vercel and
redeploys automatically on every push to `main`.

## How the pieces fit together

- **The website** (`index.html`, `leith.html`, `city.html`, `shore.html`,
  `assets/`) is plain HTML/CSS/JS — no build step. Vercel serves it as-is.
- **The menu** on each page is wired to fetch live data from Sanity
  (`assets/sanity-menu.js`) at page-load time, straight from the browser. If
  Sanity has no items for a given category, or is unreachable, the static
  menu already in the HTML is shown instead — the site never breaks.
- **Sanity Studio** — the admin tool where staff edit menu items — lives in
  its own separate project folder at `~/fishers-website/fishers-website`, not
  inside this repo. It's deployed to Sanity's own free hosting, not Vercel.
- **Editing menu content never requires a GitHub push or a Vercel deploy.**
  GitHub → Vercel is only for changes to the site's design/code.

```
Staff edits menu in Sanity Studio ──► sanity.io API ──► live site (fetches on page load)
You edit site code ──► git push ──► GitHub ──► Vercel auto-deploy
```

Both this website repo and the Studio point at the same Sanity project:
project ID `4ut45eec`, dataset `fishers_menu`.

## One-time setup

### 1. Push this repo to GitHub

```
cd ~/Downloads/Fishers-2
git remote add origin https://github.com/casper1010/fishers-restaurants.git
git branch -M main
git push -u origin main
```

(The empty repo already exists at github.com/casper1010/fishers-restaurants.)

### 2. Connect Vercel

1. Go to vercel.com/new and import the GitHub repo you just pushed.
2. Framework Preset: **Other** (it's a static site — no build command needed).
3. Root Directory: leave as `./` (the repo root).
4. Deploy. You'll get a `*.vercel.app` URL immediately; add your real domain
   under Project → Settings → Domains whenever you're ready.

From now on, every `git push` to `main` redeploys the live site automatically
— that's your "confirm it looks right" loop for design/code changes.

### 3. Deploy Sanity Studio

The Studio project already exists at `~/fishers-website/fishers-website`
(schema for all three locations, project ID `4ut45eec` / dataset
`fishers_menu` already configured). It isn't yet under version control or
deployed to a public URL:

```
cd ~/fishers-website/fishers-website
npm install
npx sanity login
npx sanity deploy
```

`sanity deploy` will ask for a studio hostname (e.g. `fishers-menu`) and give
you a URL like `https://fishers-menu.sanity.studio` — that's the login page
staff will use to edit the menu.

There's also a duplicate folder at `~/fishers-website/node -v` (looks like it
was created accidentally by a mistyped command) — safe to delete once you've
confirmed `~/fishers-website/fishers-website` is the one you're using.

Worth putting the Studio folder in its own GitHub repo too (`cd
~/fishers-website/fishers-website && git init` — it isn't one yet), separate
from the website repo, since it deploys independently.

To give an employee access to the Studio without giving them your login:
sanity.io/manage → your project → Members → Invite, and add them as
"Editor" (they can add/edit/publish content but not change project settings
or billing).

### 4. Verify end-to-end

1. Open the Vercel URL — all three menu pages should look exactly like they
   do today (Sanity has no entries yet, so the static fallback shows).
2. In Sanity Studio, add one test item to any category (e.g. a Leith
   starter) and hit Publish.
3. Refresh the live site — that item should now appear, replacing the static
   list for that category. This confirms the whole pipeline works before
   staff start relying on it.
4. Delete or unpublish the test item once confirmed.

## Adding real menu content

Each location has its own document type in Studio (Leith Menu Item / City
Menu Item / Shorebar Menu Item). For each item, choose the **Category** from
the dropdown — this determines which section of the page it shows up in. On
the City menu, Fishers Favourites and Shellfish Specials are each split into
two categories (kitchen/grill, and shellfish/surf & turf) — pick the one
matching the sub-section.

Once **any** item exists for a category, it fully replaces the static
placeholder items for that category — so a category should either be left
empty (static menu shows) or filled in completely.

Toggle **Available** off to 86 an item without deleting it (e.g. seasonal or
sold out) — it disappears from the site immediately, no redeploy needed.

**Price is a plain number in Sanity** — it can't hold combo/split pricing
like "6.75 · 10" (cup/bowl) or "21 · 42" (half-dozen/dozen). Items priced
that way are left as static HTML rather than moved into Sanity; changing
them means editing the HTML directly and pushing to GitHub.

**Not editable via Sanity** (left as static HTML by design — one-off
formatted specials rather than simple name/price/description listings, or
using combo pricing): the Leith steak cuts & "for the table" block, the City
"Pacific Rock Oysters" four-ways listing and "Orkney Scallops" serving
options, and any item anywhere using "X · Y" style combo pricing.
