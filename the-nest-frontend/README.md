# The Nest — Frontend

Next.js 16 frontend for The Nest.

## Prerequisites

- Node.js 18+
- The backend running locally (see [backend setup](../the-nest-backend/README.md))

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Fill in your values (see Environment Variables below)

# 3. Start the dev server
npm run dev

# 4. Visit the app
# http://localhost:3000
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL of the running backend (e.g. `http://localhost:8000`) |

## Notes

- The backend must be running for any data to load
- Auth uses httpOnly cookies — no tokens are stored in localStorage
- Route protection is handled by `proxy.ts` (Next.js 16 equivalent of `middleware.ts`)
