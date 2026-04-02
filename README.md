# FitAI — AI-Powered Fitness Coach SaaS

> A full-stack fitness tracking app with a personal AI coach, built with Next.js 14, TypeScript, PostgreSQL, and the Anthropic Claude API.

![FitAI Dashboard](docs/dashboard-preview.png)

## Tech Stack

| Layer       | Technology                              |
|-------------|------------------------------------------|
| Frontend    | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend     | Next.js API Routes, Zod validation       |
| Database    | PostgreSQL via Prisma ORM                |
| Auth        | NextAuth.js (credentials + Google OAuth) |
| AI          | Anthropic Claude API (streaming)         |
| Deployment  | Vercel + Supabase                        |
| Testing     | Jest + ts-jest                           |

---

## Getting Started

### Step 1 — Clone and install

```bash
git clone https://github.com/yourusername/fitai.git
cd fitai
npm install
```

### Step 2 — Set up Supabase (free PostgreSQL)

1. Go to [supabase.com](https://supabase.com) → Create new project
2. Go to **Project Settings → Database → Connection string → URI**
3. Copy the connection string

### Step 3 — Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-REF].supabase.co:5432/postgres"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="sk-ant-..."
```

Get your Anthropic API key from [console.anthropic.com](https://console.anthropic.com)

### Step 4 — Set up the database

```bash
# Push schema to your database (creates all tables)
npm run db:push

# Seed with exercise library (27 exercises)
npm run db:seed

# Optional: open visual database browser
npm run db:studio
```

### Step 5 — Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → Create an account → Start logging workouts!

---

## Project Structure

```
fitai/
├── prisma/
│   ├── schema.prisma        # Database schema — all tables defined here
│   └── seed.ts              # Seeds exercise library
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/        # NextAuth + register endpoint
│   │   │   ├── workouts/    # Workout CRUD endpoints
│   │   │   └── ai/chat/     # AI coach streaming endpoint
│   │   ├── dashboard/       # Main dashboard page
│   │   ├── ai-coach/        # AI chat page
│   │   └── login/           # Login/register page
│   │
│   ├── components/          # Reusable UI components
│   ├── hooks/               # Custom React hooks (useWorkouts, useAiChat)
│   ├── lib/                 # Prisma client, auth config
│   ├── types/               # TypeScript type definitions
│   └── __tests__/           # Jest unit tests
```

---

## Key Features

- **Workout logging** — Log exercises, sets, reps, weight, and RPE
- **Progress tracking** — Charts for strength progress and weekly volume
- **Personal records** — Automatically detects when you beat a PR
- **AI coach** — Chat with Claude, which knows your full training history
- **AI program generator** — Describe your goal, get a full multi-week program
- **Nutrition logging** — Describe a meal in plain text, AI estimates macros
- **Authentication** — Email/password + Google OAuth

---

## Development Commands

```bash
npm run dev          # Start development server
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run db:migrate   # Create and apply a new migration
npm test             # Run unit tests
npm run test:watch   # Watch mode for tests
npm run lint         # Lint the codebase
```

---

## Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, ANTHROPIC_API_KEY
```

---

## What I Learned Building This

- **TypeScript** — End-to-end type safety from database to UI using Prisma's generated types
- **PostgreSQL** — Relational database design, complex JOIN queries via Prisma
- **AI integration** — Streaming API responses with Anthropic's Claude, prompt engineering with user context injection
- **Next.js App Router** — Server components, route handlers, server-side auth
- **Testing** — Unit testing pure functions and validation schemas with Jest

---

## Roadmap

- [ ] Stripe subscription for premium AI credits
- [ ] Mobile-responsive polish
- [ ] Export workout data as CSV
- [ ] Body measurement tracking with photos
- [ ] REST API for future mobile app

---

## License

MIT
