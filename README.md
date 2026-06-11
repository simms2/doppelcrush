# DoppelCrush asset-complete browser pack

This package is the richest single upload version so far. It includes:

- full multi-page browser demo app
- local CSS and JavaScript
- local image assets in `/assets`
- branded decorative SVG graphics
- local profile images for the preview and match flow
- approved landing-page reference image

## Important
This is a polished **front-end browser app demo**. It works fully in a single browser using local storage.

It is **not yet** the final multi-user production backend.

So this version gives you:
- a live presentable demo
- onboarding flow
- selfie upload
- profile setup
- discover / matches / chats / settings / admin demo
- much more realistic visuals using local assets

## Files
- `index.html`
- `styles.css`
- `script.js`
- `assets/...`

## Easiest upload route
### GitHub Pages
1. Create or open your GitHub repo
2. Upload **all files and folders** from this pack
3. Make sure `index.html` is in the root of the repo
4. In GitHub go to **Settings → Pages**
5. Under **Build and deployment**, choose:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**
6. Save
7. Wait a minute or two and GitHub will give you a live URL

## Notes
- The app stores demo data in the browser using local storage
- If you want to reset it, open Settings in the app and click Reset
- If you had an older version before, the new storage key should keep this version separate

## Next real step after this
Build the production version on:
- Vercel
- Supabase

That next step would add real accounts, shared database, real uploads, real matching logic, and real multi-user chat.
