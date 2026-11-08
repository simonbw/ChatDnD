# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

ChatDnD is a multiplayer, AI-driven storytelling game (D&D-ish but deliberately not D&D — no dice). Players join a "room"/campaign and chat; an AI "Game Master" narrates, generates images, and manages each character's inventory.

Hosted on **Vercel** (static frontend) + **Convex** (database, realtime, server functions). There is no server process of our own.

## Commands

- `npm run dev` — runs `convex dev` (pushes `convex/` on every change) and the Vite dev server on port 3000.
- `npm run build` — Vite production build of the frontend into `dist/`.
- `npm run tsc` — type-check the client (`tsconfig.json`) and the Convex functions (`convex/tsconfig.json`). Vite does **not** type-check, so use this to verify changes.
- `npm run format` — Prettier over `src/` and `convex/`.

There is no test runner. Verification is `npm run tsc` plus trying it in the browser.

Local dev without a Convex login: `CONVEX_AGENT_MODE=anonymous npx convex dev --start vite` runs a local Convex backend (state in `.env.local`). Server env vars live on the Convex deployment, not in `.env`: set them with `npx convex env set NAME value` (`convex/lib/env.ts` lists them all: provider switches, API keys, model overrides, `DRAWING_ENABLED`).

## Architecture

- **`convex/`** — the backend. Schema in `schema.ts`; public functions in `rooms.ts`, `messages.ts`, `players.ts`, `generate.ts`; the AI loop in `gm.ts` and `summaries.ts`. Shared server helpers and prompts in `convex/lib/`.
- **`src/client/`** — React 18. Each page is an HTML file at the repo root (`index.html`, `room.html`, `test.html`) that loads an entry in `src/client/pages/`. Built by Vite (`vite.config.ts`); CSS through PostCSS + Tailwind. Static assets are in `public/static/` and served at `/static/...`.
- **`src/common/`** — Zod models and types shared by client and Convex. `convex/lib/validators.ts` mirrors them as Convex validators — keep the two in sync. `routes.ts` holds page URLs.

Routing: `vercel.json` rewrites `/room/:roomId` → `room.html` (with `cleanUrls`); `vite.config.ts` mirrors that for the dev server. Deploys run `npx convex deploy --cmd 'npm run build'`, which pushes Convex functions and injects `VITE_CONVEX_URL` into the build.

### Data and realtime

Tables: `rooms` (name + GM lock state), `players` (one per player per room; `playerId` is a client-generated id kept in localStorage), `messages` (`index` is the per-room message id clients see), `summaries`.

Clients read with Convex reactive queries (`useQuery`), which push updates automatically. The room page combines `rooms.get`, `messages.listComplete` and `messages.listInProgress`. The last two are split on purpose: the GM's streaming message updates several times a second, and keeping it out of the complete list means those updates resend only that message. Writes go through mutations (`useMutation`); anything calling an AI API is an action (`useAction`). Mutations are serializable transactions, so there are no lost-update races.

### Game Master / AI loop

Adding a non-whispered user message (or a player joining) calls `requestGmResponse` (`convex/lib/roomHelpers.ts`). Only one response runs per room: if one is running, `rooms.gm.pending` is set and the next response starts when it finishes. A response inserts an empty, incomplete assistant message and schedules `gm.respond`.

`gm.respond` (an action) builds the prompt: system prompt (`lib/prompts/initialPrompts.ts`, campaign name + players + summary), then the most recent messages (about `LAST_CHATS_MAX_CHARACTERS`). Older messages are replaced by a progressive summary from `summaries.ts`, built eagerly as messages complete. It streams the completion from the configured text provider, writing the text to the message every ~200ms.

The AI emits inline **actions** like `{ActionName|arg|arg}`. `lib/actionParser.ts` picks them out of the stream, and `gm.processAction` carries them out: `DrawCharacter`/`DrawLocation` add an image slot and schedule a drawing; `GiveItem`/`RemoveItem` edit the inventory (`lib/inventory.ts`). Valid action names are the Zod enum in `lib/prompts/abilitiesPromptContent.ts`. The client hides the braces and shows image slots only for `Draw*` actions (`Message.tsx`).

### AI services

Providers are switchable at runtime with Convex env vars, so they can be compared side by side:

- Text (`TEXT_PROVIDER` = `openai` | `anthropic`): all calls go through `lib/llm/index.ts` (`textResponse`, `streamText`), which takes provider-neutral `LlmMessage`s. `lib/llm/openai.ts` uses Chat Completions (default `gpt-4.1-mini`). `lib/llm/anthropic.ts` uses the Anthropic SDK (default `claude-opus-5-5`, server-side refusal fallback on), and adapts the prompt: leading system messages become `system`, later ones become `[Game event]` user turns, and speaker names are inlined. Claude ignores `temperature`. A refusal throws `LlmRefusalError`, and the GM discards the partial text.
- Images (`IMAGE_PROVIDER` = `stability` | `openai`): `lib/images.ts` uses Stability's Stable Image Core or OpenAI's GPT Image (default `gpt-image-2`). Results go into Convex file storage, and the stored URL is saved on the message or inventory item. If drawing is disabled or fails, `/static/images/drawing-disabled.png` is used instead.

### Other notes

- Throw `ConvexError` for errors players should see; plain `Error`s are hidden in production.
- `rooms:softReset` is an internal debug function. Run it from the Convex dashboard to clear a room's story.
