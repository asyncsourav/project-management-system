# Server Backend Architecture & System Design Manual

Engineering deep-dive for the backend powering the FYP Governance Platform.

The server is a unified HTTP + WebSockets process built on **Node.js, Express 5, MongoDB, Mongoose 9, Socket.io 4, and WebRTC**. It follows a strict four-tier architecture: **Route → Controller → Service → Model**.

> This document describes the system as it actually behaves in the current codebase, including known gaps. See the [Known Issues & Hardening In Progress](#known-issues--hardening-in-progress) section — it's part of the design record, not an afterthought.

---

## Table of Contents

- [1. Four-Tier Architecture](#1-four-tier-architecture)
- [2. Design Rationale](#2-design-rationale)
- [3. Entry Points](#3-entry-points-serverjs--appjs)
- [4. Security Pipeline](#4-security-pipeline--middlewares)
- [5. Database Models & Indexes](#5-database-models--index-strategies)
- [6. Business Services & Atomic Operations](#6-business-services--atomic-operations)
- [7. REST API Directory](#7-rest-api-directory)
- [8. WebSockets & Real-Time Engine](#8-websockets--real-time-engine)
- [9. Auto-Seeding](#9-auto-seeding-system)
- [10. Known Issues & Hardening In Progress](#10-known-issues--hardening-in-progress)

---

## 1. Four-Tier Architecture

```
Client REST Request / Socket Event
            │
            ▼
   Security Pipeline (Helmet, Mongo-Sanitize, CORS, Rate-Limit)
            │
            ▼
   Authentication & RBAC (JWT verification, role guards)
            │
            ▼
   Controller Layer (parsing, HTTP responses)
            │
            ▼
   Service Layer (business logic, atomic operations)
            │
            ▼
   Data Access Layer (Mongoose schemas, indexes)
```

1. **Routes (`router/`)** — path definitions and middleware chaining only, no business logic.
2. **Controllers (`controllers/`)** — request parsing, param validation, service invocation, JSON response formatting.
3. **Services (`services/`)** — business logic and atomic operations, shared between REST controllers and WebSocket handlers.
4. **Models (`models/`)** — Mongoose schemas, validation, hooks, indexes.

---

## 2. Design Rationale

### 2.1 Express 5 native async error propagation
Express 5 forwards rejected promises in async handlers directly to `errorMiddleware`, removing the need for third-party try/catch wrapper libraries.

### 2.2 Dual-JWT sessions
Access tokens (15m) are short-lived; refresh tokens (7d) are stored in `httpOnly` cookies and rotated on every use.

### 2.3 Refresh token hashing, rotation & reuse detection
Raw refresh token strings are never stored — only SHA-256 hashes. Every refresh issues a new token pair and revokes the old one. Replaying a revoked token triggers reuse detection: all of that user's active sessions are revoked immediately. This is implemented and verified in `auth.controller.js` — the reuse-detection branch actually calls `RefreshToken.updateMany({ user }, { isRevoked: true })`, not just a comment describing the intent.

### 2.4 Atomic MongoDB operations for faculty capacity
`$expr: { $lt: [{ $size: '$assignedStudents' }, '$maxStudents'] }` combined with `$addToSet` inside a single `findOneAndUpdate` eliminates the read-then-write race where two students could both fill a supervisor's last slot. This governs the single capacity check itself; it does not currently cover the follow-up writes (see §10).

### 2.5 Partial unique compound indexing
`Project` has a partial unique index on `{ student: 1 }` excluding `completed`/`rejected` statuses — one active proposal per student, full history preserved. `SupervisorRequest` has a similar partial unique index on `{ student: 1, supervisor: 1 }` excluding non-`pending` status, preventing duplicate pending requests to the same teacher.

### 2.6 Project completion unlinking & capacity recycling
Marking a project `completed` clears `supervisor`/`project` references on the student, pulls the student from the teacher's `assignedStudents` (`$pull`), and frees capacity — currently as sequential writes, not a single transaction (see §10).

### 2.7 Single process Express & Socket.io
One HTTP server, one port — aligns CORS, cookie handshakes, and deployment configuration.

---

## 3. Entry Points (`server.js` & `app.js`)

- **`server.js`** — connects to MongoDB, wraps Express in `http.Server`, attaches the Socket.io engine, registers chat/call socket handlers, handles `uncaughtException`/`unhandledRejection`.
- **`app.js`** — configures the security pipeline (`helmet`, `express-mongo-sanitize`, `compression`, `cookie-parser`, `express-rate-limit`), mounts `/api/v1` routes, serves Swagger docs at `/api-docs`, registers `errorMiddleware`.

---

## 4. Security Pipeline & Middlewares

1. **`helmet`** — HTTP security headers (HSTS, X-Frame-Options, X-Content-Type-Options).
2. **`express-mongo-sanitize`** — called via `.sanitize(req.body)` / `.sanitize(req.query)` directly rather than mounted as `app.use(mongoSanitize())`. This is deliberate: Express 5 makes `req.query` a read-only getter, which breaks the middleware form (it tries to reassign `req.query`). Calling `.sanitize()` directly mutates the object in place instead, which is compatible.
3. **`express-rate-limit`** — 2,000 requests / 15 min, applied globally at `/api`. Not yet split into stricter per-route limits (e.g. login).
4. **`isAuthenticated`** — verifies the access token. **Current behavior: reads only `req.cookies.accessToken` / `req.cookies.token`.** No `Authorization: Bearer` header fallback yet — API clients without a cookie jar (Postman, non-browser clients) cannot currently authenticate this way. Tracked in §10.
5. **`isAuthorized(...roles)`** — restricts endpoints by `req.user.role`.
6. **`errorMiddleware`** — centralized formatter for duplicate-key, validation, JWT, and cast errors.

---

## 5. Database Models & Index Strategies

- **`User`** — identity, bcrypt-hashed password, role (`Student`/`Teacher`/`Admin`), status, capacity (`maxStudents`/`assignedStudents`). Indexes: `{ email: 1 }` (unique), `{ role: 1 }`, `{ status: 1, isDeleted: 1 }`, `{ department: 1 }`.
- **`Project`** — proposal/deliverable lifecycle (`PROJECT_STATUS` enum: draft, pending, submitted, approved, rejected, assigned, completed). Partial unique index on `{ student: 1 }` for active proposals; compound indexes on `{ student, isDeleted }` and `{ supervisor, status, isDeleted }`.
- **`SupervisorRequest`** — partial unique index on `{ student, supervisor }` scoped to `status: 'pending'`.
- **`Connection`** — peer network state (`pending`/`accepted`/`rejected`/`blocked`) with a 10-day cooldown on re-requesting after rejection.
- **`Message`** — direct chat messages with reply-threading and emoji reactions.
- **`CallHistory`** — 1-on-1 call logs with `host`, `participants`, `status`, timestamps.
- **`RefreshToken`** — SHA-256 token hashes, unique index on `{ tokenHash: 1 }`.

---

## 6. Business Services & Atomic Operations

- **`teacherService.js`** — `acceptSupervisorRequestAtomic` performs the capacity-safe supervisor assignment described in §2.4; `getAssignedStudentsForTeacher`, request rejection.
- **`projectService.js`** — proposal creation, file attachment, project retrieval.
- **`userService.js`** — admin user provisioning and status management.
- **`fileService.js`** — Cloudinary upload/download handling.

---

## 7. REST API Directory (Base `/api/v1`)

| Route | Purpose |
|---|---|
| `/auth` | Register, login, refresh, profile, avatar, password reset/change, logout |
| `/admin` | Account creation, directory, status toggle, proposal override, supervisor assignment, stats |
| `/student` | Active project, proposal submission, file upload, supervisor requests, stats |
| `/teacher` | Proposal review, project completion, request inbox, supervisees, drop supervision |
| `/connections` | Explore, request, respond, block/unblock, history |
| `/chat` | Friends list, conversation history, reactions, call history |

Full request/response shapes are available live at `/api-docs` (Swagger UI).

---

## 8. WebSockets & Real-Time Engine

- **`chatSocket.js`** — direct messaging, online-presence tracking, typing indicators, read-receipt propagation, reaction toggling. Block status is checked before a message is allowed to send.
- **`callSocket.js`** — 1-on-1 WebRTC signaling (`initiate_call`, `answer_call`, `reject_call`, `ice_candidate`, `end_call`), missed-call system messages, and `CallHistory` logging. Active calls are tracked in an in-memory `Map`, keyed by sorted participant IDs.

**Current limitation:** socket identity is taken from `socket.handshake.auth.userId` / `socket.handshake.query.userId` without verification against the signed access token. This is the top item in §10 — treat any deployed instance as not yet safe for real user data until it's closed.

---

## 9. Auto-Seeding System

Seeds one account per role on first DB connection if no users exist (`config/seed.js`):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@university.edu` | `admin123456` |
| Teacher | `teacher@university.edu` | `teacher123456` |
| Student | `student@university.edu` | `student123456` |

Disable or gate this behind an environment flag before any real deployment.

---

## 10. Known Issues & Hardening In Progress

Documented deliberately, not discovered by someone else first.

| # | Issue | Status |
|---|---|---|
| 1 | `forgotPassword` returned the reset URL in the success response body, not just the dev-fallback path | Fixing |
| 2 | Socket connections trust a client-supplied `userId` with no JWT verification | Fixing |
| 3 | CORS (Express + Socket.io) reflects any origin back despite an unused `allowedOrigins` allowlist | Fixing |
| 4 | JWT secrets fall back to a hardcoded dev string if the env var is missing, instead of failing startup | Fixing |
| 5 | Multi-step supervisor-assignment flow (`acceptSupervisorRequestAtomic`) isn't wrapped in a DB transaction — a mid-operation crash can leave capacity and assignment state inconsistent | Fixing |
| 6 | `deleteCallHistoryRecord` doesn't verify the requester was a participant before deleting | Fixing |
| 7 | `admin.assignSupervisor` bypasses the capacity check that the teacher-accept flow enforces | Fixing |
| 8 | `isAuthenticated` only reads cookies, not an `Authorization` header | Fixing |
| — | `adminRemarks` set on `Project` documents isn't a defined schema field and is silently dropped | Backlog |
| — | `PROJECT_STATUS` enum doesn't include `under_review`/`milestone_in_progress`, which some controllers still reference as dead code | Backlog |
| — | Test coverage is limited to auth flows | Backlog |

