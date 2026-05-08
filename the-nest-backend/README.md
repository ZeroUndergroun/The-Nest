# The Nest — Backend

FastAPI backend for The Nest. Handles auth, users, posts, and the social graph.

## Prerequisites

- Python 3.11+
- A free [Supabase](https://supabase.com) project (PostgreSQL)
- A free [Resend](https://resend.com) account (email verification)

## Local Setup

```bash
# 1. Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up environment variables
cp .env.example .env
# Fill in your values (see Environment Variables below)

# 4. Run database migrations
alembic upgrade head

# 5. Start the server
uvicorn app.main:app --reload

# 6. Visit the interactive API docs
# http://localhost:8000/docs
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase PostgreSQL connection string (use Session Pooler URL for IPv4 compatibility) |
| `JWT_SECRET` | Random secret for signing auth tokens — generate with `openssl rand -hex 32` |
| `JWT_ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Short-lived token expiry (e.g. `15`) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token expiry (e.g. `7`) |
| `RESEND_API_KEY` | API key from resend.com |
| `FRONTEND_URL` | Frontend origin for CORS (e.g. `http://localhost:3000`) |

> **Note:** On the Resend free tier, verification emails only send to your verified address. The verification token is also printed to the uvicorn console as a `[DEV]` log so you can test locally without email.

## Running Tests

```bash
pytest
```

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → Database** → copy the **Session Pooler** connection string
3. Paste it as `DATABASE_URL` in your `.env` (use your database password)
4. Run `alembic upgrade head` to create all tables
