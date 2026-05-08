# The Nest

A social platform built exclusively for Cal State LA students, alumni, incoming students, and staff.

![The Nest](https://placehold.co/800x400?text=The+Nest+Screenshot)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | FastAPI (Python), SQLAlchemy, Alembic |
| Database | PostgreSQL via Supabase |
| Auth | JWT (httpOnly cookies) |
| Email | Resend |
| Hosting | Railway (backend), Vercel (frontend) |

## Monorepo Structure

```
the-nest/
├── the-nest-backend/    # FastAPI backend
├── the-nest-frontend/   # Next.js frontend
├── CONTRIBUTING.md      # How to contribute
└── README.md
```

## Getting Started

- [Backend setup](the-nest-backend/README.md)
- [Frontend setup](the-nest-frontend/README.md)

## Contributing

We welcome contributions from Cal State LA CS students! See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide — fork the repo, pick an issue labeled `good first issue`, and open a PR against `dev`.

## License

MIT
