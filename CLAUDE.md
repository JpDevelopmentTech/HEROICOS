# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HEROICOS is a running club website built with Astro and Tailwind CSS v4, based on designs created in Pencil (`.pen` files).

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build

## Tech Stack

- **Astro v6** — Static site generator
- **Tailwind CSS v4** — Via `@tailwindcss/vite` plugin (CSS-first config in `src/styles/global.css`)
- **Google Fonts** — Sora (headings) + Inter (body)
- **Icons** — Inline Lucide SVGs

## Architecture

```
src/
  layouts/Layout.astro          # Base HTML shell, font imports, global CSS
  components/
    ui/SectionLabel.astro       # Reusable "── LABEL ──" accent pattern
    Header.astro                # Sticky nav bar
    Hero.astro                  # Hero with bg image + gradient overlay
    MetricsSection.astro        # Community stats cards
    ProfileSection.astro        # Runner profile card + progress chart
    EventsSection.astro         # Events list + map
    LeaderboardSection.astro    # Ranking table with tabs
    SponsorsSection.astro       # Partner logos grid
    CtaSection.astro            # Final call-to-action
    Footer.astro                # Footer with columns + social links
  pages/index.astro             # Landing page (composes all sections)
  styles/global.css             # Tailwind import + @theme tokens
public/images/                  # Static assets (hero-bg, logo, map)
```

## Design System (Tailwind Theme)

Defined in `src/styles/global.css` via `@theme`:
- **Accent**: `accent` (#00F0FF)
- **Backgrounds**: `dark-950` (#0A0A0A), `dark-900` (#0F0F0F), `dark-800` (#1A1A1A), `dark-750` (#242424), `dark-700` (#2A2A2A)
- **Text grays**: `gray-600` (#525252), `gray-500` (#666), `gray-400` (#8A8A8A), `gray-300` (#AAA), `gray-200` (#CCC)
- **Medal colors**: `gold`, `silver`, `bronze`
- **Fonts**: `font-heading` (Sora), `font-body` (Inter)

## Design Source (Pencil)

- **File**: `untitled.pen` — Use only `pencil` MCP tools to read/modify (contents are encrypted).
- Contains two page designs at 1440px width: Landing Page (`J5ulP`) and Race Detail Page (`uGc6Z`).
- Language: Spanish throughout.
