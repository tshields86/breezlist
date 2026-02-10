# breezlist

A simple, fast PWA for creating and sharing lists. Built with React, TypeScript, and Supabase.

## Features

- **List management** — Create, edit, duplicate, and delete lists (grocery, todo, packing, etc.)
- **Real-time collaboration** — Share lists and sync changes live between users
- **Smart autocomplete** — Suggestions from your item history, ranked by frequency
- **Drag-and-drop reordering** — Manual sorting with fractional indexing
- **Templates** — Save lists as reusable templates
- **Categories** — Group items by section with collapsible headers
- **Dark/light mode** — System preference detection with manual override
- **PWA** — Installable, works standalone on mobile

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Vite
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Row Level Security)
- **Libraries:** dnd-kit, react-router-dom, vite-plugin-pwa

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Setup

1. Clone the repo and install dependencies:

   ```bash
   git clone https://github.com/tshields86/breezlist.git
   cd breezlist
   npm install
   ```

2. Copy the environment template and fill in your Supabase credentials:

   ```bash
   cp .env.example .env
   ```

   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Apply database migrations:

   ```bash
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | ESLint |

## Project Structure

```
src/
├── components/
│   ├── auth/       # Login, signup, protected route
│   ├── items/      # Item row, add input, autocomplete, sorting
│   ├── layout/     # App shell, header, bottom nav
│   ├── lists/      # List card, grid, create/share modals
│   └── ui/         # Toast, logo, theme toggle
├── contexts/       # Auth and theme providers
├── hooks/          # Custom hooks for data fetching and state
├── lib/            # Supabase client, utils, types
├── pages/          # Route pages
└── styles/         # Global CSS with theme variables
```
