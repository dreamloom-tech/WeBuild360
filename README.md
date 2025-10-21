WeBuild360
===========

Quick notes for running locally on Windows PowerShell

Problem:
- If you run `pnpm -v` and see "The term 'pnpm' is not recognized...", pnpm is not installed on your system.

Options:

1) Use the included PowerShell wrapper (recommended for Windows):

- A small script `scripts/run.ps1` is provided which will try to use `pnpm` if available and fall back to `npm` otherwise.

Usage (PowerShell):

```powershell
# Start dev server (falls back to npm if pnpm not present)
.\\scripts\\run.ps1 dev

# Build
.\\scripts\\run.ps1 build

# Start production
.\\scripts\\run.ps1 start
```

2) Install pnpm globally (optional):

If you prefer using pnpm directly, install it globally using npm:

```powershell
npm install -g pnpm
```

Then you can run `pnpm -v` to verify.

Notes
- This repository includes `package.json` scripts (`dev`, `build`, `start`) so `npm run dev` also works.
- If you want, I can add more cross-platform wrappers (bash scripts for *nix), or add npm-based scripts to package.json.

Local backend (auth + MongoDB)

This project includes simple Next API route handlers for register/login using MongoDB and JWT. To run locally:

1. Install dependencies (use npm if pnpm not installed):

```powershell
npm install
```

2. Create a local MongoDB instance (e.g., run `mongod` locally or use Docker).

3. Copy `.env.example` to `.env.local` and fill values:

- MONGO_URI (e.g., mongodb://localhost:27017)
- MONGO_DB (e.g., webuild360)
- JWT_SECRET (a secure secret)

4. Start the dev server:

```powershell
npm run dev
```

API endpoints:
- POST /api/auth/register  -> { name, email, password }
- POST /api/auth/login     -> { email, password } -> returns { token, user }

Security note: This is a minimal demo implementation. For production, use HTTPS, secure cookie flags, rotate secrets, and harden input validation.

