# Academic Final Year Project (FYP) Governance & Real-Time Collaboration Platform

A full-stack monorepo system engineered to govern university Final Year Project (FYP) lifecycles, faculty supervision capacities, proposal evaluations, document repositories, and real-time collaboration tools.

Built solo as a portfolio project to go deep on backend architecture, concurrency-safe database design, and real-time systems — not just CRUD.
Built with **Node.js (Express 5), MongoDB (Mongoose 9), React 19, Tailwind CSS 4, Socket.io 4, and WebRTC**.

> 📄 For the full engineering deep-dive (architecture, indexes, security pipeline, known limitations), see [`server/README.md`](./server/README.md).

---

## Live Demo

- **App:** https://project-management-system-c3ow.vercel.app
- **API base:** https://project-management-system-ies3.onrender.com
- **Demo accounts:** see [Auto-Seeding](#auto-seeded-demo-accounts) below

---

## Table of Contents

- [1. System Architecture & Component Interactions](#2-system-architecture--component-interactions)
- [2. Core Features](#3-core-features)
- [3. Project Proposal State Machine & Supervision Workflow](#4-project-proposal-state-machine--supervision-workflow)
- [4. Database Models, Schemas & Indexing Strategy](#6-database-models-schemas--indexing-strategy)
- [5. Real-Time Socket.io Event Specification](#8-real-time-socketio-event-specification)
- [6. Security Pipeline & Middleware Execution Chain](#9-security-pipeline--middleware-execution-chain)

---

## 1. System Architecture & Component Interactions

```
                               ┌────────────────────────────────────────┐
                               │           React 19 Frontend            │
                               │    Vite + Tailwind CSS + Contexts      │
                               └───────────────────┬────────────────────┘
                                                   │ (REST API & WebSockets)
                                                   ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       Express 5 API Server                                       │
│                                                                                                  │
│  ┌──────────────────────────┐   ┌──────────────────────────┐   ┌──────────────────────────────┐  │
│  │ Security Pipeline        │   │ Controller Tier          │   │ Real-Time Engine             │  │
│  │ Helmet, MongoSanitize,   │──>│ Request validation,      │──>│ Socket.io Event Handlers &   │  │
│  │ CORS, Rate Limiting      │   │ HTTP response formatting │   │ WebRTC P2P Call Signaling    │  │
│  └──────────────────────────┘   └─────────────┬────────────┘   └──────────────────────────────┘  │
│                                               │                                                  │
│                                               ▼                                                  │
│                                 ┌──────────────────────────┐                                     │
│                                 │ Business Services        │                                     │
│                                 │ Atomic logic & workflows │                                     │
│                                 └─────────────┬────────────┘                                     │
└───────────────────────────────────────────────┼──────────────────────────────────────────────────┘
                                                │
                                                ▼
                               ┌────────────────────────────────────────┐
                               │         MongoDB Document Store         │
                               │   Mongoose 9 Models & Compound Indexes │
                               └────────────────────────────────────────┘
```

---

## 2. Core Features

**Role-based workflow (Student / Teacher / Admin)**
- Students submit and edit project proposals, request supervisors, upload deliverables
- Teachers review proposals, accept/reject supervision requests, mark projects complete
- Admins provision accounts, override proposals, assign supervisors, view platform stats

**Session security**
- Dual-JWT sessions — short-lived access tokens, refresh tokens in `httpOnly` cookies
- Refresh token rotation with reuse detection — replaying a revoked token revokes every active session for that user
- Passwords hashed with bcrypt; refresh tokens stored as SHA-256 hashes, never raw

**Concurrency-safe data layer**
- Atomic MongoDB updates prevent two students from both filling a supervisor's last capacity slot
- Partial unique indexes enforce one active proposal per student and one pending request per student/teacher pair, while preserving full history
- Project completion unlinks supervisor/student and recycles faculty capacity

**Real-time layer**
- Direct messaging with read-receipt propagation and emoji reactions
- 1-on-1 WebRTC video calls with signaling over Socket.io and full call history logging

**Networking**
- Explore/connect with other users, accept/reject connection requests, block/unblock, cooldown on repeated rejected requests

---

## 3. Project Proposal State Machine & Supervision Workflow

```
  [ Draft ] ──────► [ Pending ] ──────► [ Approved ] ──────► [ Completed ] (Read-Only Archive)
                          │                   │                     ▲
                          │                   ▼ font                │
                          └───────────► [ Rejected ]          Supervision Released
                                              │               Student Free to Start
                                              ▼               New Project Proposal
                                     (Editable & Resubmit)
```

1. **Draft**: Proposal title and abstract written by student.
2. **Pending**: Submitted for faculty review; locked against student editing.
3. **Approved**: Accepted by faculty; unlocks faculty supervisor selector directory.
4. **Rejected**: Rejected with evaluation remarks; student can edit and resubmit.
5. **Assigned**: Supervision request accepted by faculty member; student and teacher linked.
6. **Completed**: Project completed; supervision capacity released; project locked read-only.

---

## 4. Database Models, Schemas & Indexing Strategy

- **`User`** (`server/models/user.js`): Account identity, bcrypt hashed passwords, roles (`Student`/`Teacher`/`Admin`), capacity, assigned students, supervisor reference, project reference. Index: `{ email: 1 }` (Unique).
- **`Project`** (`server/models/project.js`): Proposals and deliverables. Partial unique index on `{ student: 1 }` for active proposals.
- **`Connection`** (`server/models/connection.js`): Peer connection graph. Compound index `{ requester: 1, recipient: 1 }`.
- **`Message`** (`server/models/message.js`): Direct chat messages. Compound index `{ sender: 1, recipient: 1, createdAt: -1 }`.
- **`CallHistory`** (`server/models/callHistory.js`): 1-on-1 call logs. Index `{ host: 1, createdAt: -1 }`.
- **`RefreshToken`** (`server/models/refreshToken.js`): SHA-256 token hashes. Index `{ tokenHash: 1 }` (Unique), TTL Index `{ expiresAt: 1 }`.

---

## 5. Real-Time Socket.io Event Specification

### Direct Messaging (`chatSocket.js`)
- `send_message`: Delivers message to recipient socket; saves message document.
- `mark_read`: Emits read status updates (`isRead: true`).
- `toggle_reaction`: Broadcasts emoji reaction changes.

### WebRTC 1-on-1 Calls (`callSocket.js`)
- `initiate_call`: Triggers app-wide incoming call popup on recipient's screen.
- `answer_call`: Delivers WebRTC answer signal and logs call in `CallHistory`.
- `ice_candidate`: Forwards WebRTC candidate for NAT traversal.
- `reject_call`: Logs declined call in history and notifies caller.
- `end_call`: Terminates active call session.

---

## 6. Security Pipeline & Middleware Execution Chain

1. **Helmet**: Sets security headers (`X-Frame-Options`, `HSTS`, `X-Content-Type-Options`).
2. **MongoSanitize**: Sanitizes body, params, and query strings to block NoSQL injection.
3. **Compression**: Compresses response payloads via gzip.
4. **Cookie Parser**: Parses `httpOnly` refresh cookies.
5. **Rate Limiting**: Limits IP request frequency (2,000 requests per 15 minutes).
6. **CORS Policy**: Restricts origins with `credentials: true`.
7. **Authentication Guard**: Verifies Access Token from cookie or header.
8. **RBAC Guard**: Enforces role access restrictions.
9. **Centralized Error Middleware**: Captures unhandled errors and formats uniform JSON responses.

---

## Quick Start & Environment Configuration

### Server `.env`
```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/project_management_db
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### Commands
```bash
# Server
cd server
npm install
npm run dev

# Client
cd client
npm install
npm run dev
```

Default Seeded Accounts:
- **Admin**: `admin@university.edu` / `admin123456`
- **Teacher**: `teacher@university.edu` / `teacher123456`
- **Student**: `student@university.edu` / `student123456`
