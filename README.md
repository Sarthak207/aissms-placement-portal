# AISSMS Placement Portal

A full-stack MERN placement management portal for AISSMS College, Pune — five roles (Student,
Placement Coordinator, Placement Officer/TPO, Company HR, Admin), RBAC auth, drive/application
lifecycle management, real-time notifications, analytics, and PDF/Excel reporting.

See `docs/` for the full SRS, architecture, ER diagram, database schema, and API documentation.

## Project structure

```
aissms-placement-portal/
├── docs/       ← SRS, architecture, ER diagram, DB schema, API docs, folder structure
├── server/     ← Node.js + Express + MongoDB backend
└── client/     ← React (Vite) + Redux Toolkit + Tailwind frontend
```

## Quick start

### 1. Backend

```bash
cd server
cp .env.example .env      # fill in MONGO_URI, JWT secrets, Cloudinary, SMTP
npm install
npm run dev                # http://localhost:5000
```

Minimum required env vars to boot: `MONGO_URI`, `JWT_ACCESS_SECRET` (20+ chars),
`JWT_REFRESH_SECRET` (20+ chars). SMTP and Cloudinary can be left blank in local dev —
emails will log to the console instead of sending, and file uploads will fail gracefully
until configured.

### 2. Frontend

```bash
cd client
cp .env.example .env       # defaults already point at localhost:5000
npm install
npm run dev                 # http://localhost:5173
```

### 3. First-run data

The app has no seed script yet. To get a working system:
1. Register a student and a company_hr account via `/register` — accounts are usable
   immediately, no email verification step (this was intentionally removed; see note below).
2. You'll need at least one Department/Branch and one Admin account to unlock the full flow.
   Create these directly in MongoDB for the very first run, e.g.:
   ```js
   db.departments.insertOne({ name: 'Engineering', code: 'ENG' })
   db.branches.insertOne({ name: 'Computer Science', code: 'CSE', departmentId: ObjectId('...') })
   ```
   Then promote a user to `admin` role directly in the `users` collection, or use the
   `/admin/users` endpoint once you have one admin bootstrapped.

> **Note:** Email verification on signup has been removed for simplicity — `POST /auth/register`
> now creates accounts with `isEmailVerified: true` immediately, so anyone can register and log
> in right away. Password reset still uses email (via `SMTP_*` env vars) since that one needs a
> real out-of-band channel to be secure. If you want signup verification back, reintroduce the
> token-generation step in `server/src/services/auth.service.js`'s `register()` function and a
> login-time check for `user.isEmailVerified`.

## Testing

```bash
cd server
npm test              # unit tests — fast, no database needed (19 tests: ApiError, pagination, drive eligibility engine)
npm run test:integration   # full auth + application-flow tests against an in-memory MongoDB
npm run test:all      # both
```

`npm test` (unit) was run and verified passing during development (19/19 green).

`npm run test:integration` uses `mongodb-memory-server`, which downloads a MongoDB binary
from `fastdl.mongodb.org` on first run. That domain wasn't reachable from the sandboxed
environment this project was built in, so **the integration tests are written but were not
executed during development** — they should run normally on a machine or CI runner with
regular internet access. If you'd rather not download a binary, point `MONGO_URI` at a real
local/Atlas MongoDB instead and adapt `tests/setup.js` to skip `MongoMemoryServer` and just
`mongoose.connect(process.env.MONGO_URI)` directly.

## Verified working

Both `server` and `client` have been syntax-checked, dependency-installed, built, and
runtime-tested (health-check / preview-serve) during development. The backend's unit test
suite (19 tests covering error handling, pagination, and the drive eligibility engine) passes.
Integration tests exist but are unverified in this environment for the network reason above.


## Deployment

- **Frontend** → Vercel (connect the `client/` directory, set `VITE_API_BASE_URL` and
  `VITE_SOCKET_URL` to your deployed backend)
- **Backend** → Render (Docker or Node web service; `server/Dockerfile` included)
- **Database** → MongoDB Atlas
- **Files** → Cloudinary
