## Live demo

[Link](https://nextjs-coding-challenge-fawn.vercel.app)

## How to run

### Prerequisites

- Node.js 18+
- pnpm

### Setup

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Start Convex backend** (Terminal 1)

   ```bash
   npx convex dev
   ```

   On first run you'll be prompted to:
   - **Sign in** (GitHub) – cloud deployment, free tier available
   - **Use local deployment** – no account needed, runs locally

   This creates `.env.local` with `NEXT_PUBLIC_CONVEX_URL`.

3. **Start Next.js** (Terminal 2)

   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Features

- **Real-time leaderboard** – live progress, WPM, and accuracy for all players
- **Fixed-time rounds** – 60s rounds with a new, random sentence each time
- **Metrics** – WPM, accuracy
- **Player persistence** – same nickname loads previous stats
- **Table controls** – sort by name/WPM/accuracy, pagination, rows per page
- **URL sync** – sort and pagination state in URL
- **Loading & error states** – basic feedback for async operations

## Tech stack & choices

| Choice  
 | Reason |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| **Convex** | Real-time subscriptions out of the box, no WebSocket setup. Fits the "typeracer" use case perfectly. |
| **shadcn/ui** | Fast to build with, accessible, customizable. |
| **TypeScript** | Type safety across the stack. |
| **localStorage for player ID** | Simple identity without auth – suitable for a demo. Same nickname = same player. |

## Assumptions & simplifications

- **Player identity**: Identified by nickname only. No login; returning players with the same name get their stats.
- **Round duration**: Fixed 60 seconds per round.
- **Sentences**: Static JSON file (25 sentences). No external API or LLM.
- **WPM formula**: Standard 5 chars = 1 word. Only correctly typed characters count.
- **Accuracy**: `correctChars / sentenceLength` – denominator is the target sentence, not total keystrokes.

## What I'd add in production

- **Tests** – unit tests for `metrics.ts`, e2e for core flows (Playwright)
- **Monitoring** – error tracking (e.g. Sentry), basic analytics
- **Rate limiting** – throttle `updateProgress` to prevent abuse
- **Input validation** – sanitize nicknames, max length
- **More sentences** – external source or API
- **Better file structure** - simply skipped cause of the limited time
- **CI/CD** - pipeline to handle new features and test them before merging.

## AI usage

I used AI in Cursor mainly for small things like type hints, autocomplete and some UI boilerplate. I always read through the suggestions, adjusted them, and made sure they fit the structure I had in mind. The game rules, data model, Convex functions and overall behaviour of rounds, metrics and leaderboard were designed and implemented by me, with AI helping as a coding assistant rather than writing features end-to-end.
