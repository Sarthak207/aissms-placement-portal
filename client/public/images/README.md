# Real college assets go here

This folder is served as-is at the site root (e.g. `client/public/images/logo.png` → `https://yoursite.com/images/logo.png`).

Drop in these files with these **exact names** and the app will automatically use them instead of the built-in placeholder artwork — no code changes needed:

| File | Used for | Recommended size |
|---|---|---|
| `college-logo.png` (or `.svg`) | Navbar / sidebar / auth screen logo | Square, ~256×256px, transparent background |
| `campus.jpg` (or `.png`) | Landing page hero image | Landscape, 1200×900px or larger |

Until these are added, the app shows:
- An original wax-seal monogram in place of the logo (`src/components/Logo.jsx`)
- An original illustrated campus building in place of the photo (`src/components/CampusIllustration.jsx`)

Both fall back gracefully (no broken-image icons) via an `onError` handler, so it's always
safe to leave this folder empty, add one file, or add both.

**Note on using AISSMS College's actual logo/photos:** those are the college's own IP — get
sign-off from the placement cell / college administration before publishing real campus
photography or the official crest on a live site.
