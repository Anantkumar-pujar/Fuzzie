<p align="center">
  <img src="public/fuzzieLogo.png" alt="Fuzzie Logo" width="80" height="80" />
</p>

<h1 align="center">Fuzzie — Workflow Automation Platform</h1>

<p align="center">
  <strong>Automate your work by connecting your favourite apps with a visual drag-and-drop workflow builder.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Integrations](#integrations)
- [Pages & Routes](#pages--routes)
- [API Endpoints](#api-endpoints)
- [State Management](#state-management)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts & Tooling](#scripts--tooling)
- [Deployment & Distribution](#deployment--distribution)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Fuzzie** is a full-stack SaaS workflow automation platform that lets users connect multiple third-party services — Google Drive, Discord, Notion, and Slack — and orchestrate automated actions between them through an intuitive, visual drag-and-drop editor powered by React Flow.

Users can create multi-step workflows (e.g., *"When a file is uploaded to Google Drive → post a message in Discord → create a row in Notion"*), publish them, and monitor execution history through a built-in logging dashboard — all without writing a single line of code.

The platform includes a credit-based billing system (powered by Stripe), tiered subscription plans (Free / Pro / Unlimited), user authentication via Clerk, and a fully responsive dark-mode UI built with shadcn/ui components.

---

## Key Features

| Category | Feature |
|---|---|
| **Visual Workflow Builder** | Drag-and-drop node editor built on React Flow with undo/redo history |
| **Multi-Service Integrations** | Google Drive, Discord, Notion, Slack — with OAuth2 flows for each |
| **Event-Driven Triggers** | Google Drive file-change webhooks, cron schedules, and manual triggers |
| **Action Nodes** | Send Discord messages, create Notion entries, post to Slack channels, and more |
| **Execution Logging** | Full audit trail with status, duration, credits consumed, and trigger data |
| **Dashboard Analytics** | Real-time stats — total workflows, active connections, credit usage, current plan |
| **Credit System** | Workflow executions consume credits; plans range from Free (10) to Unlimited |
| **Stripe Billing** | Subscription management with Stripe checkout sessions and webhook handling |
| **User Authentication** | Clerk-powered sign-in/sign-up with middleware-level route protection |
| **Dark / Light Mode** | Theme toggling via `next-themes` with CSS variable-based design tokens |
| **Responsive UI** | Mobile-first layout with sidebar navigation, info bar, and resizable panels |
| **Standalone Deployment** | Next.js standalone output for portable/containerized distribution |

---

## Architecture

Fuzzie follows a **layered architecture** with clear separation between the client, server, integration, and data layers:

```
┌──────────────────────────────────────────────────────────────┐
│  CLIENT LAYER                                                │
│  Browser → Next.js Client (React 18) → React Flow Editor     │
├──────────────────────────────────────────────────────────────┤
│  FRONTEND (Next.js App Router)                               │
│  Pages, Layouts, Components, shadcn/ui, Tailwind, Framer     │
├──────────────────────────────────────────────────────────────┤
│  SERVER LAYER                                                │
│  API Routes (/api/*), Server Actions, Clerk Middleware,       │
│  Workflow Orchestrator, Cron Scheduler                        │
├──────────────────────────────────────────────────────────────┤
│  INTEGRATION LAYER                                           │
│  Adapters: Google, Notion, Slack, Discord, Uploadcare, Stripe │
│  Webhook Receivers: /api/clerk-webhook, /api/drive-activity,  │
│                     /api/payment                              │
├──────────────────────────────────────────────────────────────┤
│  DATA & STORAGE                                              │
│  PostgreSQL (Neon) via Prisma ORM                            │
│  Object Storage (Uploadcare / CDN)                           │
│  Execution Logs (DB)                                         │
├──────────────────────────────────────────────────────────────┤
│  AUTH: Clerk  │  DEV: ngrok tunnel, mkcert HTTPS             │
└──────────────────────────────────────────────────────────────┘
```

> Architecture, Data Flow, and Sequence diagrams (in Mermaid format) are available in the [`architecture/`](architecture/) directory.

---

## Tech Stack

### Core Framework
| Technology | Purpose |
|---|---|
| [Next.js 14](https://nextjs.org/) | Full-stack React framework (App Router, Server Components, API Routes) |
| [React 18](https://react.dev/) | UI library with server & client components |
| [TypeScript 5](https://www.typescriptlang.org/) | Static type safety across the entire codebase |

### UI & Styling
| Technology | Purpose |
|---|---|
| [Tailwind CSS 3](https://tailwindcss.com/) | Utility-first CSS framework |
| [shadcn/ui](https://ui.shadcn.com/) | Accessible, customizable Radix-based UI components |
| [Framer Motion](https://www.framer.com/motion/) | Production-grade animations and transitions |
| [Lucide React](https://lucide.dev/) | Icon library |
| [next-themes](https://github.com/pacocoursey/next-themes) | Dark/light theme management |
| [React Flow](https://reactflow.dev/) | Visual workflow / node-based graph editor |
| [tsParticles](https://particles.js.org/) | Animated particle backgrounds (landing page) |

### Backend & Data
| Technology | Purpose |
|---|---|
| [Prisma 6](https://www.prisma.io/) | Type-safe ORM for PostgreSQL |
| [Neon PostgreSQL](https://neon.tech/) | Serverless Postgres database |
| [Clerk](https://clerk.com/) | Authentication, user management, and middleware |
| [Stripe](https://stripe.com/) | Billing and subscription management |
| [Zod](https://zod.dev/) | Runtime schema validation for forms and API data |

### State Management
| Technology | Purpose |
|---|---|
| [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight global state (Google file selections, Slack channels) |
| React Context + useReducer | Editor state (nodes, edges, selection history) |
| React Context | Connection states (Discord, Notion, Slack, Google) |

### Integrations & APIs
| Service | Usage |
|---|---|
| [Google APIs](https://developers.google.com/) | Drive activity monitoring, file change webhooks, OAuth2 |
| [Discord API](https://discord.com/developers/) | Webhook-based message posting to channels |
| [Notion API](https://developers.notion.com/) | Database entry creation and workspace access |
| [Slack API](https://api.slack.com/) | Bot channel messaging, OAuth2 token management |
| [Uploadcare](https://uploadcare.com/) | File upload widget and CDN-hosted object storage |

### Dev Tools
| Tool | Purpose |
|---|---|
| [ngrok](https://ngrok.com/) | Public tunnel for webhook testing in development |
| [mkcert](https://github.com/FiloSottile/mkcert) | Local HTTPS certificates for `--experimental-https` |
| ESLint | Code linting with Next.js config |

---

## Project Structure

```
fuzzie-production/
├── architecture/               # Mermaid diagrams (architecture, DFD, sequence)
│   ├── archi.txt               # System architecture flowchart
│   ├── dfd.txt                 # Data flow diagram
│   └── seq.txt                 # Sequence diagram
│
├── certificates/               # Local HTTPS certificates (mkcert)
│   ├── localhost-key.pem
│   └── localhost.pem
│
├── prisma/
│   └── schema.prisma           # Database schema (7 models)
│
├── public/                     # Static assets (logos, integration icons, landing images)
│   ├── fuzzieLogo.png
│   ├── discord.png / notion.png / slack.png / googleDrive.png
│   └── p1–p6.png               # Product showcase images
│
├── scripts/                    # Build & utility scripts
│   ├── build-exe.js            # Standalone .exe builder
│   ├── create-portable-package.bat  # Portable distribution packaging
│   ├── check-workflow-status.ts     # Workflow status checker
│   ├── delete-notion-connections.ts # Notion cleanup utility
│   ├── reset-google-listener.ts     # Google listener reset
│   ├── test-notification.ts         # Notification tester
│   └── test-webhook.bat            # Webhook testing
│
├── src/
│   ├── app/
│   │   ├── (auth)/             # Authentication routes
│   │   │   ├── sign-in/        # Clerk sign-in page
│   │   │   └── sign-up/        # Clerk sign-up page
│   │   │
│   │   ├── (main)/             # Authenticated app shell (sidebar + infobar layout)
│   │   │   └── (pages)/
│   │   │       ├── billing/    # Subscription plan management
│   │   │       ├── connections/ # OAuth integration management
│   │   │       │   ├── _actions/  # Server actions (Discord, Notion, Slack, Google)
│   │   │       │   └── _components/  # Connection cards, Drive listener card
│   │   │       ├── dashboard/  # Overview stats, recent workflows, quick actions
│   │   │       ├── logs/       # Execution history with filtering & search
│   │   │       ├── settings/   # User profile settings
│   │   │       └── workflows/  # Workflow listing and creation
│   │   │           ├── _actions/     # Create, delete workflow server actions
│   │   │           ├── _components/  # Workflow cards, buttons, credits display
│   │   │           └── editor/       # Visual drag-and-drop workflow editor
│   │   │               └── [editorId]/
│   │   │                   ├── _actions/    # Save workflow connections
│   │   │                   └── _components/ # Canvas, sidebar, nodes, accordions
│   │   │
│   │   ├── api/                # API routes
│   │   │   ├── auth/callback/  # OAuth callback handler
│   │   │   ├── clerk-webhook/  # Clerk user sync webhook
│   │   │   ├── drive/          # Google Drive API proxy
│   │   │   ├── drive-activity/ # Drive activity + webhook notification handler
│   │   │   ├── payment/        # Stripe checkout session creation
│   │   │   └── workflow-executions/  # Execution log CRUD
│   │   │
│   │   ├── globals.css         # CSS variables (light/dark), Tailwind base
│   │   ├── layout.tsx          # Root layout (Clerk, Theme, Billing, Modal providers)
│   │   └── page.tsx            # Landing page (hero, parallax, pricing cards)
│   │
│   ├── components/
│   │   ├── forms/              # Profile and workflow creation forms
│   │   ├── global/             # Shared UI: navbar, 3D cards, lamp, parallax, sparkles
│   │   ├── icons/              # Custom SVG icon components
│   │   ├── infobar/            # Top info bar (breadcrumbs, user avatar)
│   │   ├── sidebar/            # Navigation sidebar with menu items
│   │   └── ui/                 # 23 shadcn/ui primitives (button, card, dialog, etc.)
│   │
│   ├── lib/
│   │   ├── constant.ts         # Navigation menu, editor card types, connection defs
│   │   ├── db.ts               # Prisma client singleton
│   │   ├── editor-utils.ts     # Workflow editor helper functions
│   │   ├── env-validation.ts   # Startup environment variable validation
│   │   ├── types.ts            # TypeScript types, Zod schemas, node mapper
│   │   └── utils.ts            # Tailwind `cn()` merge utility
│   │
│   ├── providers/
│   │   ├── billing-provider.tsx      # Credits & tier context
│   │   ├── connections-provider.tsx   # Discord/Google/Notion/Slack node state
│   │   ├── editor-provider.tsx       # Workflow editor state (useReducer + Context)
│   │   ├── modal-provider.tsx        # Global modal management
│   │   └── theme-provider.tsx        # next-themes wrapper
│   │
│   ├── store.tsx               # Zustand store (Google files, Slack channels)
│   ├── types/
│   │   └── uploadcare.d.ts     # Uploadcare type declarations
│   └── middleware.ts           # Clerk auth middleware (public/protected route matching)
│
├── server.js                   # Custom standalone server entry point
├── next.config.mjs             # Next.js config (standalone output, image remotePatterns)
├── tailwind.config.ts          # Tailwind config (custom animations, shadcn theming)
├── components.json             # shadcn/ui CLI configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
└── DEMO_DISTRIBUTION_GUIDE.md  # Portable package, .exe, and Docker distribution guide
```

---

## Database Schema

The database uses **PostgreSQL** (hosted on Neon) with **Prisma ORM**. The schema defines 7 models:

```
┌─────────────────┐    ┌──────────────────────────┐
│     User         │───▶│  LocalGoogleCredential    │  (1:1)
│─────────────────│    │  accessToken, channelId,   │
│ clerkId, email   │    │  folderId, subscribed      │
│ name, tier       │    └──────────────────────────┘
│ credits          │
│ profileImage     │──┬─▶ DiscordWebhook[]  (1:N)
│                  │  ├─▶ Notion[]           (1:N)
│                  │  ├─▶ Slack[]            (1:N)
│                  │  ├─▶ Connections[]       (1:N)
│                  │  └─▶ Workflows[]         (1:N)
└─────────────────┘
                          │
        ┌─────────────────┘
        ▼
┌─────────────────┐     ┌─────────────────────────┐
│   Workflows      │────▶│  WorkflowExecution       │  (1:N)
│─────────────────│     │  status, triggeredBy,     │
│ name, description│     │  executedActions, error,  │
│ nodes, edges     │     │  creditsUsed,             │
│ publish, flowPath│     │  executionTime            │
│ templates (D/N/S)│     └─────────────────────────┘
└─────────────────┘

┌─────────────────┐
│   Connections    │   Polymorphic junction table
│─────────────────│   linking User ↔ service credentials
│ type, userId     │   (Discord, Notion, Slack)
│ discordWebhookId │   Unique constraint: [userId, type]
│ notionId, slackId│
└─────────────────┘
```

### Key Models

| Model | Description |
|---|---|
| `User` | Core user identity linked to Clerk; tracks tier and credit balance |
| `LocalGoogleCredential` | Stores Google OAuth tokens and Drive webhook subscription state |
| `DiscordWebhook` | Discord webhook URLs mapped to guilds and channels |
| `Notion` | Notion workspace credentials and target database IDs |
| `Slack` | Slack bot tokens, team info, and authed user data |
| `Connections` | Polymorphic join table linking users to their integration credentials |
| `Workflows` | Workflow definitions (serialized nodes/edges), templates, and publish state |
| `WorkflowExecution` | Execution audit log with status, actions performed, errors, and timing |

---

## Integrations

### Google Drive
- **OAuth2 flow** via Google APIs client
- **Webhook listener** at `/api/drive-activity/notification` for real-time file change events
- Channel subscription management with `channelId` and `pageToken` tracking
- Used as a **Trigger** node in workflows

### Discord
- **OAuth2 connection** for server/guild access
- Webhook URL storage for posting messages to specific channels
- Used as an **Action** node — sends formatted messages when workflow executes

### Notion
- **OAuth2 flow** for workspace and database access
- Creates database entries with structured content
- Used as an **Action** node in workflows

### Slack
- **OAuth2 flow** with bot token management
- Lists bot-accessible channels for message targeting
- Multi-channel message posting support
- Used as an **Action** node in workflows

### Stripe
- Checkout session creation via `/api/payment`
- Plans: **Free** ($0, 10 credits), **Pro** ($2, 100 credits), **Unlimited** ($8, unlimited credits)

### Clerk
- User authentication (sign-in/sign-up)
- Webhook at `/api/clerk-webhook` for user data synchronization
- Middleware-level route protection with public route allowlisting

---

## Pages & Routes

### Public Routes
| Route | Description |
|---|---|
| `/` | Landing page — hero section, product parallax, pricing cards, client carousel |
| `/sign-in` | Clerk-powered sign-in |
| `/sign-up` | Clerk-powered sign-up |

### Protected Routes (require authentication)
| Route | Description |
|---|---|
| `/dashboard` | Overview with stats cards (workflows, connections, credits, plan), recent workflows, and quick actions |
| `/workflows` | List all workflows with create/delete functionality |
| `/workflows/editor/[id]` | Visual drag-and-drop workflow editor with React Flow canvas, node sidebar, connection configuration, and publish controls |
| `/connections` | Manage OAuth connections to Google Drive, Discord, Notion, and Slack; includes Google Drive listener configuration |
| `/billing` | Subscription plan management and Stripe checkout |
| `/settings` | User profile editing (name, email, profile image via Uploadcare) |
| `/logs` | Workflow execution history with search, status filtering, and detailed action breakdowns |

---

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/callback` | GET | OAuth2 callback handler for Google |
| `/api/clerk-webhook` | POST | Clerk webhook for user sync on signup/update |
| `/api/drive` | GET | Google Drive API proxy (list files, activity) |
| `/api/drive-activity` | GET | Fetch Drive activity for the authenticated user |
| `/api/drive-activity/notification` | POST | Google Drive push notification webhook receiver |
| `/api/payment` | POST | Create Stripe checkout session for plan upgrades |
| `/api/workflow-executions` | GET | Fetch paginated execution logs with status filtering |

---

## State Management

Fuzzie uses a **three-tier** state management approach:

1. **Zustand Store** (`src/store.tsx`)  
   Global client-side state for Google file data and Slack channel selections. Lightweight and reactive.

2. **React Context Providers** (`src/providers/`)
   - `ConnectionsProvider` — manages live connection states for Discord, Google, Notion, and Slack nodes
   - `EditorProvider` — workflow editor state via `useReducer` with undo/redo history
   - `BillingProvider` — user credits and subscription tier
   - `ModalProvider` — global modal state management
   - `ThemeProvider` — dark/light theme toggling

3. **Server-Side State**  
   Prisma database queries in Server Components and Server Actions for persistent data (workflows, connections, user profiles).

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** or **yarn**
- A PostgreSQL database (recommend [Neon](https://neon.tech/))
- Accounts & OAuth apps configured for: [Clerk](https://clerk.com/), [Google Cloud](https://console.cloud.google.com/), [Discord Developer](https://discord.com/developers/), [Notion](https://www.notion.so/my-integrations), [Slack](https://api.slack.com/apps), [Stripe](https://stripe.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Anantkumar-pujar/Fuzzie.git
cd Fuzzie

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.development
# Fill in all required values (see Environment Variables section below)

# 4. Set up the database
npx prisma generate
npx prisma db push

# 5. Start the development server
npm run dev
```

The app will be available at `https://localhost:3000` (HTTPS via `--experimental-https`).

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with experimental HTTPS |
| `npm run build` | Create production build (standalone output) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Environment Variables

Copy `.env.example` to `.env.development` (or `.env.production`) and populate:

| Variable | Required | Description |
|---|---|---|
| **`NODE_ENV`** | ✅ | `development` or `production` |
| **`DATABASE_URL`** | ✅ | PostgreSQL connection string (Neon) |
| **`DIRECT_URL`** | ✅ | Direct PostgreSQL URL (bypasses pooler) |
| **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`** | ✅ | Clerk publishable key |
| **`CLERK_SECRET_KEY`** | ✅ | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | — | Sign-in route (default: `/sign-in`) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | — | Sign-up route (default: `/sign-up`) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | — | Post-login redirect (default: `/dashboard`) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | — | Post-signup redirect (default: `/dashboard`) |
| `NEXT_PUBLIC_URL` | — | App base URL |
| `NEXT_PUBLIC_DOMAIN` | — | App domain |
| `NEXT_PUBLIC_SCHEME` | — | URL scheme (`http` or `https`) |
| **`GOOGLE_CLIENT_ID`** | ✅ | Google OAuth client ID |
| **`GOOGLE_CLIENT_SECRET`** | ✅ | Google OAuth client secret |
| `OAUTH2_REDIRECT_URI` | — | Google OAuth redirect URI |
| `NEXT_PUBLIC_GOOGLE_SCOPES` | — | Google API scopes |
| `DISCORD_CLIENT_ID` | ⚠️ | Discord OAuth client ID |
| `DISCORD_CLIENT_SECRET` | ⚠️ | Discord OAuth client secret |
| `DISCORD_TOKEN` | ⚠️ | Discord bot token |
| `DISCORD_PUBLIC_KEY` | ⚠️ | Discord application public key |
| `NEXT_PUBLIC_DISCORD_REDIRECT` | ⚠️ | Discord OAuth redirect URI |
| `NOTION_API_SECRET` | ⚠️ | Notion integration secret |
| `NOTION_CLIENT_ID` | ⚠️ | Notion OAuth client ID |
| `NOTION_REDIRECT_URI` | ⚠️ | Notion OAuth redirect URI |
| `NEXT_PUBLIC_NOTION_AUTH_URL` | ⚠️ | Notion authorization URL |
| `SLACK_SIGNING_SECRET` | ⚠️ | Slack app signing secret |
| `SLACK_BOT_TOKEN` | ⚠️ | Slack bot token |
| `SLACK_APP_TOKEN` | ⚠️ | Slack app-level token |
| `SLACK_CLIENT_ID` | ⚠️ | Slack OAuth client ID |
| `SLACK_CLIENT_SECRET` | ⚠️ | Slack OAuth client secret |
| `SLACK_REDIRECT_URI` | ⚠️ | Slack OAuth redirect URI |
| `NGROK_URI` | — | ngrok tunnel URL for webhook testing |
| `CRON_JOB_KEY` | — | Secret key for cron job authentication |
| `STRIPE_SECRET` | ⚠️ | Stripe secret key |

> ✅ = Required for the app to start &nbsp; ⚠️ = Required for the respective integration to work &nbsp; — = Optional / has defaults

---

## Scripts & Tooling

The `scripts/` directory contains utility scripts for development and deployment:

| Script | Description |
|---|---|
| `create-portable-package.bat` | Creates a portable distribution folder with standalone build, launcher script, and config |
| `build-exe.js` | Packages the app into a standalone `.exe` using `pkg` |
| `check-workflow-status.ts` | CLI tool to inspect workflow status in the database |
| `delete-notion-connections.ts` | Utility to clean up Notion connection records |
| `reset-google-listener.ts` | Resets Google Drive webhook listener state |
| `test-notification.ts` | Sends test notifications through configured channels |
| `test-webhook.bat` | Quick webhook endpoint testing |

---

## Deployment & Distribution

### Development
```bash
npm run dev
# → https://localhost:3000 (experimental HTTPS)

# For webhook testing, start ngrok:
ngrok http --domain=your-domain.ngrok-free.dev 3000
```

### Production Build
```bash
npm run build
npm run start
# Or use the custom server:
node server.js
```

### Distribution Options

The project supports three distribution methods (see [`DEMO_DISTRIBUTION_GUIDE.md`](DEMO_DISTRIBUTION_GUIDE.md) for full details):

| Method | Best For | Requirements |
|---|---|---|
| **Portable Package** ⭐ | Demos, CD distribution | Node.js |
| **Standalone .exe** | Single-file distribution | None |
| **Docker Container** | Cross-platform deployment | Docker |

```bash
# Portable package (recommended):
scripts\create-portable-package.bat

# Standalone executable:
node scripts/build-exe.js

# Docker:
docker build -t fuzzie-app .
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

This project is private. All rights reserved.

---

<p align="center">
  Built with ❤️ using Next.js, React Flow, and shadcn/ui
</p>
