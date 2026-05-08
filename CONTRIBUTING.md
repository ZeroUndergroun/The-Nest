# Contributing to The Nest

Thanks for your interest in contributing! This guide will get you from zero to a merged PR.

## Before You Start

- All PRs target the `dev` branch — **never open a PR against `main`**
- Pick an issue labeled `good first issue` if you're new
- Comment on the issue to let others know you're working on it

## Workflow

```
1. Fork the repo on GitHub
2. Clone your fork:
   git clone https://github.com/YOUR_USERNAME/The-Nest.git
   cd The-Nest

3. Add the upstream remote:
   git remote add upstream https://github.com/ZeroUndergroun/The-Nest.git

4. Create a branch off dev:
   git checkout dev
   git pull upstream dev
   git checkout -b feature/your-short-description

5. Make your changes and commit:
   git add <files>
   git commit -m "feat: describe what you did"

6. Push and open a PR:
   git push origin feature/your-short-description
   # Open PR on GitHub → base branch: dev
```

## Branch Naming

| Type | Format | Example |
|------|--------|---------|
| New feature | `feature/short-description` | `feature/post-likes` |
| Bug fix | `fix/short-description` | `fix/login-redirect` |
| Docs | `docs/short-description` | `docs/update-readme` |
| Chore | `chore/short-description` | `chore/update-deps` |

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
feat: add like button to PostCard
fix: correct token expiry calculation
chore: update fastapi to 0.115
docs: add backend setup instructions
```

## Local Setup

- [Backend setup](the-nest-backend/README.md) — FastAPI + PostgreSQL
- [Frontend setup](the-nest-frontend/README.md) — Next.js

Both services must be running for the full app to work.

## Finding Something to Work On

1. Go to the [Issues tab](https://github.com/ZeroUndergroun/The-Nest/issues)
2. Filter by `good first issue` for beginner-friendly tasks
3. Leave a comment on the issue before starting so we don't duplicate work

## PR Checklist

Before submitting, make sure:
- [ ] Your PR targets `dev`, not `main`
- [ ] You've described what the change does and why
- [ ] You've linked the issue it closes (`Closes #N`)
- [ ] The app runs locally without errors
- [ ] No `console.log` or debug code left in
- [ ] Screenshots included if it's a UI change

## Questions?

Open a GitHub Discussion or leave a comment on the relevant issue.
