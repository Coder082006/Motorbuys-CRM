# Motorbuy Frontend Changes

This file summarizes the frontend work done on the Motorbuy project.

## Files Changed

- `src/routes/index.tsx`
  - Simplified the homepage hero section.
  - Added `bike2.jpg` as the local hero background image.
  - Added a small bottom fade on the hero image.
  - Centered the hero text and placed the main button below it.
  - Updated the hero button text to support English and Swahili.
  - Removed the old navigation links from the header.
  - Reworked the header layout with language toggle, centered logo, search, and auth buttons.
  - Added English/Swahili UI switching for the main homepage text.
  - Updated customer-facing labels, buttons, section headings, product cards, categories, reviews, and footer text for Swahili mode.
  - Updated footer contact information to Dar es Salaam, Tanzania and +255 755 005 000.
  - Removed footer social links.

- `.nvmrc`
  - Added Node version `22` so the project runs with the Vite version used here.

- `package-lock.json`
  - Refreshed dependency lock data while fixing the local frontend run/build environment.

## Assets Used

- `bike2.jpg`
  - Used as the homepage hero background.

## How To Run

```bash
nvm use
npm run dev -- --host 127.0.0.1
```

The frontend usually opens on `http://127.0.0.1:5173/`. If that port is busy, Vite will choose the next available port.
