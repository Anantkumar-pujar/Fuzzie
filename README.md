<p align="center">
  <img src="public/fuzzieLogo.png" alt="Fuzzie Logo" width="80" height="80" />
</p>

<h1 align="center">Fuzzie — Workflow Automation Platform</h1>

<p align="center">
  <strong>Automate your work by connecting your favourite apps with a visual drag-and-drop workflow builder.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql" alt="PostgreSQL" />
</p>

---

## Overview

**Fuzzie** is a full-stack SaaS workflow automation platform that lets users connect Google Drive, Discord, Notion, and Slack, and orchestrate automated actions between them through a drag-and-drop editor built on React Flow.

Users build multi-step workflows (e.g. *"When a file is uploaded to Google Drive → post a message in Discord → create a row in Notion"*), publish them, and monitor execution history through a logging dashboard. The app includes credit-based billing (Stripe), tiered plans (Free / Pro / Unlimited), authentication via Clerk, and a shadcn/ui-based dark/light UI.

## Key Features

- **Visual workflow builder** — drag-and-drop node editor (React Flow) with undo/redo
- **Integrations** — Google Drive, Discord, Notion, Slack, each with their own OAuth2 flow
- **Triggers** — Google Drive file-change webhooks, cron schedules, manual runs
- **Actions** — send Discord messages, create Notion entries, post to Slack channels
- **Execution logging** — audit trail with status, duration, credits used, and trigger data
- **Credits & billing** — Stripe checkout/subscriptions gate workflow executions by plan
- **Auth** — Clerk sign-in/sign-up with middleware-level route protection

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router), React 18, TypeScript 5 |
| UI | Tailwind CSS, shadcn/ui, Framer Motion, React Flow, tsParticles |
| Data | Prisma 6 ORM, PostgreSQL (Neon) |
| Auth & Billing | Clerk, Stripe |
| Validation | Zod |
| State | Zustand (global), React Context + `useReducer` (editor/connections state) |
| Integrations | Google APIs, Discord API, Notion API, Slack API, Uploadcare |
| Dev tooling | ngrok (webhook tunneling), mkcert (local HTTPS) |

## Project Structure

```
fuzzie-production/
├── architecture/        # Mermaid diagrams (architecture, DFD, sequence)
├── docs/devops/          # Deployment/roadmap notes
├── infra/                # Terraform (AWS) + ECS task definition
├── prisma/schema.prisma  # Database schema (8 models)
├── public/               # Static assets
├── scripts/              # Dev/deployment utility scripts
├── src/
│   ├── app/
│   │   ├── (auth)/            # Clerk sign-in / sign-up
│   │   ├── (main)/(pages)/    # billing, connections, dashboard, logs, settings, workflows
│   │   │   └── workflows/editor/[editorId]/  # drag-and-drop workflow editor
│   │   └── api/                # auth, clerk-webhook, drive, drive-activity, health, payment, workflow-executions
│   ├── components/            # forms, global, icons, infobar, sidebar, ui (shadcn primitives)
│   ├── lib/                    # constants, prisma client, editor utils, env validation, types
│   ├── providers/               # billing, connections, editor, modal, theme context providers
│   ├── store.tsx                # Zustand store (Google files, Slack channels)
│   └── middleware.ts            # Clerk auth middleware
├── Dockerfile / docker-compose.yml   # Container build & local orchestration
└── server.js                    # Custom standalone server entry point
```

## Database Schema

PostgreSQL (Neon) via Prisma. Core models: `User`, `LocalGoogleCredential`, `DiscordWebhook`, `Notion`, `Slack`, `Connections`, `Workflows`, `WorkflowExecution`. A `User` owns many `Workflows`, integration credentials, and a `Connections` join table linking them together; each `Workflows` row produces `WorkflowExecution` audit records (status, actions run, credits used, timing).

## API Routes

| Route | Description |
|---|---|
| `/api/auth/callback` | Google OAuth2 callback |
| `/api/clerk-webhook` | Clerk user sync webhook |
| `/api/drive`, `/api/drive-activity` | Google Drive API proxy & activity fetch |
| `/api/drive-activity/notification` | Google Drive push-notification webhook receiver |
| `/api/payment` | Stripe checkout session creation |
| `/api/workflow-executions` | Paginated execution logs |
| `/api/health` | Health check endpoint |

## Getting Started

### Prerequisites
- Node.js ≥ 18, npm
- A PostgreSQL database (e.g. [Neon](https://neon.tech/))
- OAuth apps configured for [Clerk](https://clerk.com/), [Google Cloud](https://console.cloud.google.com/), [Discord](https://discord.com/developers/), [Notion](https://www.notion.so/my-integrations), [Slack](https://api.slack.com/apps), and a [Stripe](https://stripe.com/) account

### Installation

```bash
git clone https://github.com/Anantkumar-pujar/Fuzzie.git
cd Fuzzie
npm install

cp .env.example .env.development   # fill in the required values
npx prisma generate
npx prisma db push

npm run dev
```

App runs at `https://localhost:3001` (HTTPS via `--experimental-https`).

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with experimental HTTPS |
| `npm run build` | Production build (standalone output) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

The `scripts/` directory also has standalone helpers: `check-workflow-status.ts`, `delete-notion-connections.ts`, `reset-google-listener.ts`, `test-notification.ts`, plus packaging scripts (`build-exe.js`, `create-portable-package.bat`, `test-webhook.bat`).

## Environment Variables

See `.env.example` for the full list. Required at minimum: `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. Per-integration vars (`DISCORD_*`, `NOTION_*`, `SLACK_*`, `STRIPE_SECRET`) are only needed for that integration to work.

## Deployment

- **Docker**: `Dockerfile` + `docker-compose.yml` build a standalone container (`docker build -t fuzzie-app .`)
- **AWS**: Terraform configs and an ECS task definition live under `infra/`
- **CI/CD**: GitHub Actions workflows in `.github/workflows/` (`ci.yml`, `deploy-aws-ecs.yml`)
- **Portable/offline distribution**: see [`DEMO_DISTRIBUTION_GUIDE.md`](DEMO_DISTRIBUTION_GUIDE.md) for the portable-package and standalone-`.exe` options

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes and push
4. Open a Pull Request

## License

This project is private. All rights reserved.
