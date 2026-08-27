# BizPilot AI

A premium, always-dark intelligent business command centre that streamlines professional workflows through five integrated AI tools. Built with TanStack Start, React 19, TypeScript, and Tailwind CSS v4.

## Live Demo

- **Published site**: https://bizpilot-command-center-05.lovable.app
- **Preview site**: https://id-preview--0c633482-a2c0-410e-ba1a-cdf12a0aac49.lovable.app

## Features

BizPilot AI connects five AI-powered tools into a single, unified workflow:

1. **Smart Email Generator** – Draft polished, ready-to-send professional emails with subject lines, tailored by recipient, tone, and purpose.
2. **Meeting Summarizer** – Turn raw meeting notes into structured briefs with summaries, decisions, action items, and open questions.
3. **Task Planner** – Convert goals and notes into prioritized schedules with effort estimates and risk flags.
4. **Research Assistant** – Produce concise business research briefs with fact-check alerts and suggested next steps.
5. **Workplace Chatbot** – Ask BizPilot anything for drafting help, brainstorming, prioritization, or productivity advice.

### Unified Workflow

Outputs from one tool can be handed off to another. For example, meeting summaries can flow straight into task planning or email follow-ups.

## Tech Stack

- **Framework**: [TanStack Start v1](https://tanstack.com/start) (full-stack React 19 with SSR/SSG)
- **Build Tool**: [Vite 7](https://vitejs.dev)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with CSS theme variables
- **AI**: Lovable AI Gateway using `google/gemini-3.7-flash`
- **Icons**: [Lucide React](https://lucide.dev)

## Project Structure

```
src/
  components/        # Shared UI components (AppShell, OutputPanel, etc.)
  lib/               # Client utilities and server functions
    ai.functions.ts  # AI server-function wrappers
    ai.server.ts     # AI gateway client
    saved.ts         # LocalStorage save/handoff helpers
  routes/            # TanStack file-based routes
  styles.css         # Tailwind v4 entry + theme tokens
  start.ts           # App bootstrap
```

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- `npm` or `bun`

### Install and Run

```sh
git clone <this-repository-url>
cd bizpilot-command-center
bun install
bun run dev
```

The dev server runs on `http://localhost:8080`.

### AI Configuration

The AI features use the Lovable AI Gateway. The server function reads `LOVABLE_API_KEY` at call time — no client-side API keys required.

## Responsible AI

AI outputs are drafts. Always review names, dates, figures, and commitments before sending or acting on generated content.

## License

This project is built and owned by its creator. See the repository for licensing details.
