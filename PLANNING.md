# The Nest — Project Planning Document

> A Cal State LA exclusive social platform connecting current students, alumni,
> and incoming students. Built by a Cal State LA student, for the Cal State LA community.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Database Schema](#3-database-schema)
4. [API Design](#4-api-design)
5. [Folder Structure](#5-folder-structure)
6. [Authentication Flow](#6-authentication-flow)
7. [Security](#7-security)
8. [Deployment Targets](#8-deployment-targets)
9. [Scaling Notes](#9-scaling-notes)
10. [Adoption Strategy](#10-adoption-strategy)
11. [Build Phases](#11-build-phases)

---

## 1. Project Overview

**App name:** The Nest
**Domain:** Cal State LA only — verified via `.calstatela.edu` email
**Core value:** A dedicated space for Cal State LA students, alumni, and incoming
students to connect, share, and build relationships across class years.

### User roles

| Role | Description |
|---|---|
| `current_student` | Actively enrolled at Cal State LA |
| `alumni` | Graduated from Cal State LA |
| `incoming_student` | Admitted but not yet on campus |

### MVP feature set

- Email-verified registration (`.calstatela.edu` only)
- User profiles with role badges
- Post feed with replies, likes, reposts
- Follow system
- Hashtag discovery
- Direct messaging
- Notifications

---

## 2. Tech Stack

### Decision rationale

Twitter's stack (Scala, Manhattan, Kafka) is enterprise-scale overkill. Our stack
is chosen for developer velocity, Python familiarity, and clean scaling path.

| Layer | Technology | Hosting |
|---|---|---|
| Frontend | Next.js + TypeScript + Tailwind | Vercel |
| Backend | FastAPI (Python) | Railway |
| Database | PostgreSQL | Supabase |
| Auth | Supabase Auth + custom JWT | Supabase |
| Email | Resend (or SendGrid) | — |
| Realtime | Supabase Realtime | Supabase |
| File storage | Supabase Storage | Supabase |

### Why PostgreSQL over MySQL

- Superior JSONB, UUID, ARRAY, and ENUM type support
- Supabase is built on Postgres — auth and realtime are native
- SQLAlchemy and FastAPI treat Postgres as first-class
- Better complex query planner for social graph queries

### Why FastAPI over Django/Flask

- Python — familiar language
- Native async support — important for feed and realtime endpoints
- Auto-generated OpenAPI docs at `/docs`
- Dependency injection system makes auth middleware trivial

---

## 3. Database Schema

### Tables

#### `users`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
email           VARCHAR UNIQUE NOT NULL
username        VARCHAR UNIQUE NOT NULL
display_name    VARCHAR NOT NULL
avatar_url      VARCHAR
bio             TEXT
role            ENUM('current_student', 'alumni', 'incoming_student') NOT NULL
email_verified  BOOLEAN DEFAULT false
is_active       BOOLEAN DEFAULT true
created_at      TIMESTAMP DEFAULT now()
updated_at      TIMESTAMP DEFAULT now()
```

#### `posts`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID REFERENCES users(id) ON DELETE CASCADE
content         TEXT NOT NULL (max 280 chars)
parent_post_id  UUID REFERENCES posts(id) ON DELETE CASCADE (nullable — null = original post)
is_reply        BOOLEAN DEFAULT false
like_count      INT DEFAULT 0
reply_count     INT DEFAULT 0
repost_count    INT DEFAULT 0
created_at      TIMESTAMP DEFAULT now()
updated_at      TIMESTAMP DEFAULT now()
```

#### `follows`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
follower_id     UUID REFERENCES users(id) ON DELETE CASCADE
following_id    UUID REFERENCES users(id) ON DELETE CASCADE
created_at      TIMESTAMP DEFAULT now()
UNIQUE(follower_id, following_id)
```

#### `likes`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID REFERENCES users(id) ON DELETE CASCADE
post_id         UUID REFERENCES posts(id) ON DELETE CASCADE
created_at      TIMESTAMP DEFAULT now()
UNIQUE(user_id, post_id)
```

#### `reposts`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id         UUID REFERENCES users(id) ON DELETE CASCADE
post_id         UUID REFERENCES posts(id) ON DELETE CASCADE
created_at      TIMESTAMP DEFAULT now()
UNIQUE(user_id, post_id)
```

#### `notifications`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
recipient_id    UUID REFERENCES users(id) ON DELETE CASCADE
actor_id        UUID REFERENCES users(id) ON DELETE CASCADE
type            ENUM('like', 'repost', 'reply', 'follow', 'mention') NOT NULL
post_id         UUID REFERENCES posts(id) ON DELETE CASCADE (nullable)
is_read         BOOLEAN DEFAULT false
created_at      TIMESTAMP DEFAULT now()
```

#### `direct_messages`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
sender_id       UUID REFERENCES users(id) ON DELETE CASCADE
recipient_id    UUID REFERENCES users(id) ON DELETE CASCADE
content         TEXT NOT NULL
is_read         BOOLEAN DEFAULT false
created_at      TIMESTAMP DEFAULT now()
```

#### `hashtags`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
tag             VARCHAR UNIQUE NOT NULL
usage_count     INT DEFAULT 0
created_at      TIMESTAMP DEFAULT now()
```

#### `post_hashtags`
```sql
post_id         UUID REFERENCES posts(id) ON DELETE CASCADE
hashtag_id      UUID REFERENCES hashtags(id) ON DELETE CASCADE
PRIMARY KEY (post_id, hashtag_id)
```

### Key design decisions

- `like_count`, `reply_count`, `repost_count` are **denormalized** on `posts` for
  feed performance — avoids COUNT queries on every feed load
- `parent_post_id` self-references `posts` — replies are just posts pointing to
  another post, no separate replies table needed
- All IDs are UUIDs — non-guessable, safe to expose in URLs
- `follows`, `likes`, `reposts` have UNIQUE constraints — prevents duplicates at
  the database level, not just application level

---

## 4. API Design

**Base URL:** `https://api.thenest.calstatela.app/api`
**Auth:** JWT via httpOnly cookie on all protected routes

### Auth routes — `/api/auth`

| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| POST | `/register` | Register with .calstatela.edu email | No |
| POST | `/verify-email` | Confirm verification token | No |
| POST | `/login` | Login, returns JWT tokens | No |
| POST | `/logout` | Invalidate session | Yes |
| POST | `/refresh` | Refresh expired access token | No (uses refresh token) |

### Posts routes — `/api/posts`

| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| GET | `/feed` | Paginated home feed | Yes |
| POST | `/` | Create a new post | Yes |
| GET | `/{id}` | Get single post + replies | Yes |
| DELETE | `/{id}` | Delete own post | Yes |
| POST | `/{id}/like` | Toggle like on a post | Yes |
| POST | `/{id}/repost` | Toggle repost | Yes |
| POST | `/{id}/reply` | Reply to a post | Yes |

### Users routes — `/api/users`

| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| GET | `/{username}` | Get public profile | Yes |
| PATCH | `/me` | Update own profile | Yes |
| GET | `/{username}/posts` | Get user's posts | Yes |
| POST | `/{username}/follow` | Toggle follow/unfollow | Yes |
| GET | `/{username}/followers` | Get follower list | Yes |
| GET | `/{username}/following` | Get following list | Yes |
| GET | `/search` | Search by name or role | Yes |

### Messages routes — `/api/messages`

| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| GET | `/` | List all DM conversations | Yes |
| GET | `/{username}` | Get conversation with user | Yes |
| POST | `/{username}` | Send a direct message | Yes |
| DELETE | `/{id}` | Delete a sent message | Yes |

### Misc routes

| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| GET | `/notifications` | Get unread notifications | Yes |
| PATCH | `/notifications/read` | Mark notifications as read | Yes |
| GET | `/hashtags/{tag}` | Get posts by hashtag | Yes |
| GET | `/hashtags/trending` | Top hashtags | Yes |

---

## 5. Folder Structure

### Frontend — `the-nest-frontend/`

```
app/
  (auth)/
    login/
    register/
    verify-email/
  (main)/
    feed/
    profile/[username]/
    post/[id]/
    messages/
    notifications/
  layout.tsx              # Root layout
  page.tsx                # Landing / redirect

components/
  ui/                     # Button, Input, Modal, Avatar, Badge
  feed/                   # PostCard, FeedList, ComposeBox
  profile/                # ProfileHeader, RoleBadge, FollowButton
  layout/                 # Sidebar, Navbar, MobileNav

lib/
  api.ts                  # Axios/fetch client — base URL + interceptors
  auth.ts                 # Token helpers, cookie reads
  utils.ts                # Date formatting, text truncation

hooks/
  useAuth.ts              # Current user state
  useFeed.ts              # Feed fetching + pagination
  useNotifications.ts     # Notification polling

store/
  authStore.ts            # Zustand — user session state
  uiStore.ts              # Zustand — modals, sidebar state

types/
  user.ts                 # User, Role, Profile interfaces
  post.ts                 # Post, Reply interfaces
  api.ts                  # API response shapes

public/                   # Static assets, logo

middleware.ts             # Next.js route protection (root level)
.env.local                # NEXT_PUBLIC_API_URL, Supabase keys
next.config.ts
tailwind.config.ts
tsconfig.json
package.json
```

### Backend — `the-nest-backend/`

```
app/
  main.py                 # FastAPI app init, router registration, CORS
  config.py               # Pydantic Settings — env vars
  database.py             # SQLAlchemy engine + session factory
  dependencies.py         # get_current_user, get_db — injected everywhere

  routers/
    auth.py               # /api/auth/* routes
    posts.py              # /api/posts/* routes
    users.py              # /api/users/* routes
    messages.py           # /api/messages/* routes
    notifications.py      # /api/notifications/* routes
    hashtags.py           # /api/hashtags/* routes

  models/
    user.py               # SQLAlchemy User model
    post.py               # SQLAlchemy Post model
    follow.py             # SQLAlchemy Follow model
    like.py               # SQLAlchemy Like model
    repost.py             # SQLAlchemy Repost model
    message.py            # SQLAlchemy DirectMessage model
    notification.py       # SQLAlchemy Notification model
    hashtag.py            # SQLAlchemy Hashtag + PostHashtag models

  schemas/
    user.py               # UserCreate, UserResponse, UserUpdate
    post.py               # PostCreate, PostResponse
    auth.py               # LoginRequest, TokenResponse, RegisterRequest
    message.py            # MessageCreate, MessageResponse

  services/
    auth_service.py       # register(), login(), verify_email(), refresh_token()
    post_service.py       # create_post(), toggle_like(), toggle_repost(), get_feed()
    feed_service.py       # get_home_feed() — ranking + pagination logic
    user_service.py       # get_profile(), toggle_follow(), search_users()
    email_service.py      # send_verification_email(), send_password_reset()
    notification_service.py  # create_notification(), mark_read()

alembic/                  # Database migrations
  versions/               # Migration files
  env.py
  alembic.ini

tests/
  test_auth.py
  test_posts.py
  test_users.py

.env                      # DATABASE_URL, JWT_SECRET, RESEND_API_KEY
requirements.txt
Dockerfile
alembic.ini
```

---

## 6. Authentication Flow

### Token strategy

| Token | Lifetime | Storage | Purpose |
|---|---|---|---|
| Access token | 15 minutes | httpOnly cookie | Sent with every API request |
| Refresh token | 7 days | httpOnly cookie | Issues new access token on expiry |

**Why httpOnly cookies over localStorage:**
- Not accessible by JavaScript — immune to XSS attacks
- Automatically attached to every request by the browser
- Industry standard for Next.js session management

### Registration flow

1. User submits form with email, password, role
2. Next.js POSTs to `/api/auth/register`
3. `auth_service.register()` runs:
   - Validates email ends in `@calstatela.edu` → 400 if not
   - Checks email not already registered → 400 if taken
   - Hashes password with bcrypt
   - Saves user to DB with `email_verified = false`
   - Generates a verification token
   - Sends verification email via Resend
4. User clicks link in email → `/api/auth/verify-email?token=xxx`
5. Token validated → `email_verified = true`
6. User redirected to login

### Login flow

1. User submits email + password
2. FastAPI verifies bcrypt hash
3. Checks `email_verified = true` → 401 if not verified
4. Generates access token (15min) + refresh token (7d)
5. Tokens set as httpOnly cookies in response
6. User redirected to `/feed`

### Protected route flow

1. User navigates to any `(main)/` route
2. Next.js `middleware.ts` intercepts at the edge (< 5ms)
3. Reads JWT from cookie
4. If missing/invalid → redirect to `/login`
5. If expired → attempt silent refresh via `/api/auth/refresh`
6. If refresh fails → redirect to `/login`
7. If valid → page renders, user object available

### `get_current_user` dependency (FastAPI)

```python
# app/dependencies.py
async def get_current_user(
    token: str = Cookie(None),
    db: Session = Depends(get_db)
) -> User:
    if not token:
        raise HTTPException(status_code=401)
    payload = verify_jwt(token)
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401)
    return user
```

Every protected route adds `current_user: User = Depends(get_current_user)` —
auth is injected automatically, zero repetition.

---

## 7. Security

### Passwords

| Concern | Technology | Notes |
|---|---|---|
| Hashing | `passlib[bcrypt]` | Cost factor 12 — bcrypt is slow by design, making brute force infeasible |
| Salting | bcrypt built-in | Unique salt per password — identical passwords produce different hashes |
| Storage | PostgreSQL | Only the hash is ever stored — plaintext never touches the DB |

```python
# Install: pip install passlib[bcrypt]
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

hashed = pwd_context.hash(plain_password)          # on register
valid  = pwd_context.verify(plain_password, hashed) # on login
```

### JWT session security

| Concern | Technology | Notes |
|---|---|---|
| Token signing | `python-jose` HS256 | Signed with a 32-byte random secret — tampered tokens rejected |
| Storage | httpOnly cookie | Invisible to JavaScript — immune to XSS attacks |
| CSRF protection | SameSite=Strict | Cookie not sent from other domains — blocks CSRF attacks |
| Access token TTL | 15 minutes | Short-lived — stolen tokens expire quickly |
| Refresh token TTL | 7 days | Used only to issue new access tokens silently |

```python
# Generate a strong JWT secret (run once, store in .env)
# python -c "import secrets; print(secrets.token_hex(32))"
```

### Data in transit

All traffic encrypted by TLS 1.3 automatically via Vercel and Railway. No
configuration needed — both platforms provision SSL certificates for free.
Set `Strict-Transport-Security` header in Vercel config to enforce HTTPS permanently.

### Direct messages

| Layer | Technology | Notes |
|---|---|---|
| In transit | TLS 1.3 | Encrypted between client and server |
| At rest | Supabase AES-256 | All DB data encrypted on disk by default |
| Access control | Row Level Security | Only sender + recipient can query their messages |
| Phase 2: E2E | libsodium | True E2E — server cannot read messages. Adds key management complexity. |

### Photos and file uploads

| Concern | Technology | Notes |
|---|---|---|
| Storage encryption | Supabase AES-256 | All files encrypted at rest automatically |
| Access control | Signed URLs | Time-limited URLs — copied links expire |
| File validation | MIME + size check | Backend rejects non-images and oversized files before storage |

```python
# Validate uploads in FastAPI before sending to Supabase Storage
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE_MB = 5

if file.content_type not in ALLOWED_MIME_TYPES:
    raise HTTPException(400, "Invalid file type")
if file.size > MAX_FILE_SIZE_MB * 1024 * 1024:
    raise HTTPException(400, "File too large")
```

### API hardening

| Concern | Technology | Notes |
|---|---|---|
| SQL injection | SQLAlchemy ORM | Parameterised queries by default — injection structurally impossible |
| Input validation | Pydantic schemas | All request bodies validated before reaching service layer |
| Rate limiting | `slowapi` | Per-IP request limits — tighter on `/auth` routes |
| CORS | FastAPI CORSMiddleware | Only `thenest.app` whitelisted — other origins rejected |
| Secrets | `.env` + Railway secrets | Never hardcoded — `.env` in `.gitignore` from day one |

```python
# FastAPI CORS setup — app/main.py
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://thenest.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting — app/main.py
from slowapi import Limiter
from slowapi.util import get_remote_address
limiter = Limiter(key_func=get_remote_address)

# On auth routes:
@router.post("/login")
@limiter.limit("10/minute")
async def login(request: Request, ...):
    ...
```

### Security libraries — full install list

```bash
pip install passlib[bcrypt]   # password hashing
pip install python-jose[cryptography]  # JWT tokens
pip install slowapi           # rate limiting
```

---

## 8. Deployment Targets

| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Auto-deploys from GitHub main branch |
| Backend | Railway | Dockerfile deploy, auto-scales |
| Database | Supabase | Managed Postgres + auth + realtime |
| Email | Resend | Free tier: 3,000 emails/month |
| Media | Supabase Storage | Avatar images, future post media |

### Environment variables

**Frontend `.env.local`**
```
NEXT_PUBLIC_API_URL=https://api.thenest.app
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Backend `.env`**
```
DATABASE_URL=postgresql://user:password@host:5432/thenest
JWT_SECRET=your_long_random_secret_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
RESEND_API_KEY=your_resend_key
FRONTEND_URL=https://thenest.app
```

---

## 9. Scaling Notes

### Current ceiling by layer

| Layer | Free tier limit | Upgrade path |
|---|---|---|
| Vercel (frontend) | Effectively unlimited | N/A |
| Railway (backend) | ~500-1000 concurrent req | Add instances behind load balancer |
| Supabase DB | 500MB, ~50 connections | Pro ($25/mo) — PgBouncer pooling |
| Supabase Realtime | 200 concurrent connections | Pro tier — 500 connections |

### When to add what

- **0–500 users:** No changes needed. Free tiers hold.
- **500–2,000 users:** Upgrade Supabase to Pro ($25/mo).
- **2,000–10,000 users:** Add Redis caching for feed on Railway.
  Move notification emails to async Celery queue.
- **10,000+ users:** PostgreSQL read replicas. CDN for media.
  Multiple Railway instances behind load balancer.

### Feed caching strategy (when needed)

```
Request → Check Redis cache for user feed
  Cache hit  → Return in < 10ms
  Cache miss → Query Postgres → Store in Redis (60s TTL) → Return
```

---

## 10. Adoption Strategy

### Cold start plan

The Nest only has value when people are on it. Break the chicken-and-egg
problem deliberately:

1. **Seed with 20–30 real users before public launch.** Personally recruit
   classmates, club members, 1-2 alumni. Create real content first.

2. **Target high-leverage communities first:**
   - Student government
   - CS / Engineering departments
   - Student journalism / media orgs
   - Club sports and Greek life

3. **Get one alumni success story early.** One post from an alum who landed
   a job via a connection on The Nest proves the entire value proposition.

4. **Time launch to orientation week or first week of fall semester.**
   Highest connection-seeking anxiety, lowest established routines.

### Retention-driving features (already in design)

- **Role badges** — make profiles immediately legible across class years
- **Major/club hashtags** — `#CSdept`, `#EagleCross` — discoverable communities
- **Alumni DMs** — first real conversation that helps someone = retained user

### Ongoing engagement hooks

- Weekly alumni spotlight post on official Nest account
- Partner with student orgs to post events exclusively on The Nest
- Alumni job/internship board — drives daily return visits

---

## 11. Build Phases

### Phase 1 — MVP (build first)

- [ ] Backend: FastAPI scaffold + database setup + Alembic migrations
- [ ] Auth: Register, email verification, login, JWT middleware
- [ ] Posts: Create, read, delete, feed
- [ ] Users: Profiles, follow/unfollow
- [ ] Frontend: Auth pages, feed page, profile page
- [ ] Deploy: Vercel + Railway + Supabase

### Phase 2 — Community features

- [ ] Likes and reposts
- [ ] Replies / threaded posts
- [ ] Direct messaging
- [ ] Notifications
- [ ] Hashtag pages + trending
- [ ] User search

### Phase 3 — Growth and polish

- [ ] Mobile-responsive PWA
- [ ] Redis feed caching
- [ ] Alumni job/internship board
- [ ] Campus event listings
- [ ] Email notification digests
- [ ] Admin moderation tools

---

## Claude Code usage instructions

When using Claude Code to scaffold or build from this document:

```
cd the-nest-backend
claude
> Read PLANNING.md. Scaffold the full FastAPI project structure —
  create all folders and starter files including main.py, config.py,
  database.py, dependencies.py, all routers, models, schemas, and
  services. Use SQLAlchemy + PostgreSQL. Follow the schema in section 3.

cd the-nest-frontend
claude
> Read PLANNING.md. Scaffold the Next.js project structure —
  app directory with route groups, components, lib, hooks, store,
  types, and middleware.ts. Use TypeScript and Tailwind.
```

Start with Phase 1. Build auth first — everything else depends on it.

---

*Generated during planning session — The Nest, May 2026*