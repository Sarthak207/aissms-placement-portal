# System Architecture — AISSMS Placement Portal

## 1. High-Level Architecture

```
                         ┌────────────────────────┐
                         │        Users            │
                         │ Student / TPO / Coord /  │
                         │  Company HR / Admin       │
                         └────────────┬─────────────┘
                                      │ HTTPS
                         ┌────────────▼─────────────┐
                         │   React SPA (Vercel)      │
                         │  Vite + Redux Toolkit +   │
                         │  React Router + Axios     │
                         │  interceptors (JWT)       │
                         └────────────┬─────────────┘
                                      │ REST (JSON) + WebSocket
                         ┌────────────▼─────────────┐
                         │  Express API (Render)     │
                         │  ─ Middleware layer:       │
                         │    helmet, cors, rate-limit│
                         │    auth, rbac, validation  │
                         │  ─ Controllers → Services  │
                         │  ─ Socket.io (notifications)│
                         └───┬───────────┬───────────┘
                             │           │
              ┌──────────────▼──┐   ┌────▼─────────────┐
              │ MongoDB Atlas    │   │ Cloudinary        │
              │ (Mongoose ODM)   │   │ (files: resume,   │
              │                  │   │ photo, logos, PDFs)│
              └──────────────────┘   └────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  Nodemailer/SMTP  │
                    │ (verification,    │
                    │  notifications)   │
                    └───────────────────┘
```

## 2. Backend Layered Architecture (MVC + Service Layer)

```
Request → Router → Middleware (auth, rbac, validate) → Controller
        → Service (business logic) → Model (Mongoose) → MongoDB
        ← Controller formats response ← Service returns data
```

- **Routes**: map HTTP verb+path to controller, attach middleware.
- **Middleware**: `authenticate` (verify JWT), `authorize(...roles)` (RBAC), `validate(schema)` (Zod/Joi), `rateLimiter`, `errorHandler` (centralized).
- **Controllers**: thin — parse req, call service, send response.
- **Services**: business logic (eligibility checks, application state transitions, report generation).
- **Models**: Mongoose schemas + instance/static methods.
- **Utils**: token generation, email templates, PDF/Excel builders, logger (Winston).

## 3. Frontend Architecture

```
src/
 ├─ app/            → Redux store, root reducer
 ├─ features/       → slice per domain (auth, students, companies, drives, applications, notifications)
 ├─ pages/           → route-level components
 ├─ components/      → reusable UI (Table, Card, Modal, Chart, Skeleton...)
 ├─ layouts/         → DashboardLayout, AuthLayout, PublicLayout
 ├─ hooks/            → useAuth, useDebounce, usePagination, useSocket
 ├─ services/         → axios instance + API modules (authApi, studentApi, ...)
 ├─ routes/           → RoleProtectedRoute, route config
 └─ utils/            → formatters, validators
```

State: **Redux Toolkit** for auth/session + server cache via RTK Query (recommended) — avoids duplicating loading/error state logic across ~15 modules.

## 4. Authentication Flow

1. Login → server validates credentials → issues **access token** (JWT, 15 min, returned in response body) + **refresh token** (JWT, 7–30 days, httpOnly + Secure + SameSite=strict cookie, hashed copy stored in `Sessions` collection).
2. Axios request interceptor attaches `Authorization: Bearer <access>`.
3. On 401, Axios response interceptor calls `/auth/refresh` (cookie sent automatically) → gets new access token → retries original request once.
4. Refresh rotation: each refresh invalidates the old refresh token record and issues a new one (prevents replay).
5. Logout: clears cookie + deletes session record.

## 5. RBAC Model

Each route declares allowed roles:
```js
router.post('/drives', authenticate, authorize('company', 'tpo'), validate(createDriveSchema), driveController.create);
```
Row-level checks happen in the service layer (e.g., HR can only mutate drives where `drive.company === req.user.companyId`).

## 6. Real-time Notifications

Socket.io namespace `/notifications`, room per `userId`. On events (application status change, new drive matching eligibility, interview scheduled) the service emits to the relevant room(s) and also queues an email via Nodemailer.

## 7. Deployment Topology

| Component | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Auto-deploy from `main`, env vars for API base URL |
| Backend | Render (Web Service) | Auto-deploy, health check `/api/health`, env vars for secrets |
| Database | MongoDB Atlas | M0/M10 cluster, IP allowlist or VPC peering, daily backups |
| File storage | Cloudinary | Unsigned upload presets restricted by folder + type |
| Email | SMTP (SendGrid/Gmail) | Templated via Handlebars/Nodemailer |

## 8. Security Layers
1. Network: HTTPS everywhere, CORS allowlist (frontend origin only).
2. Application: Helmet headers, express-rate-limit (global + strict on auth), express-mongo-sanitize, xss-clean, hpp.
3. Auth: bcrypt (cost 12), short-lived JWT, refresh rotation, CSRF token for cookie-mutating requests.
4. Data: Mongoose schema validation, Zod validation at API boundary, least-privilege DB user.
5. Audit: `AuditLogs` collection records actor, action, target, timestamp, IP for all admin/HR mutating actions.
