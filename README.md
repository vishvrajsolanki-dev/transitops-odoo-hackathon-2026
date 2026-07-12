# TransitOps — Smart Transport Operations Platform

Built for: 8-hour hackathon
Team: 4 builders (2 pairs)

## What this is

A centralized platform for the full lifecycle of transport operations — vehicle registry, driver management, trip dispatch, maintenance, fuel/expense tracking, and reporting — replacing spreadsheet-based fleet management.

**Unique angle:** a live state-machine visualizer that shows vehicle and driver status transitions in real time on the dashboard as trips are dispatched/completed and maintenance opens/closes — making the underlying business-rule engine visible during the demo instead of hidden behind status text.

## Stack

| Layer | Choice |
|---|---|
| Backend | Node.js + Express |
| ORM / DB | Prisma + PostgreSQL |
| Frontend | React (Vite) + Tailwind |
| Auth | JWT |

## Project Structure

```
transitops-odoo-hackathon-2026/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       ← single source of truth for all tables
│   │   └── seed.js
│   └── src/
│       ├── config/             ← db.js, env.js
│       ├── middleware/         ← auth.js, checkPermission.js
│       ├── modules/            ← one folder per domain (controller/routes/service)
│       │   ├── auth/
│       │   ├── vehicles/
│       │   ├── drivers/
│       │   ├── trips/
│       │   ├── maintenance/
│       │   ├── fuel-expense/
│       │   └── reports/
│       ├── utils/
│       │   └── response.js     ← locked API response envelope
│       ├── app.js
│       └── server.js
└── frontend/
    └── src/
        ├── components/         ← shared/reusable only
        ├── pages/               ← one folder per module, mirrors backend
        ├── services/            ← one api client per module
        ├── context/             ← AuthContext.jsx
        └── utils/
```

## Locked Conventions

- **Naming**: files/folders `kebab-case`, React components `PascalCase`, JS vars/functions `camelCase`, DB columns `snake_case`, API routes `kebab-case` plural.
- **API response envelope**: every endpoint returns `{ success: true, data }` or `{ success: false, error: { code, message } }` — no raw `res.json()` elsewhere.
- **Auth**: JWT payload is `{ userId, role, iat, exp }`. Token kept in memory/context, never localStorage.
- **RBAC**: enforced via `middleware/checkPermission(module, action)` — see the permission matrix below.
- **Schema ownership**: `prisma/schema.prisma` is edited by one person at a time per session to avoid merge conflicts — ping before editing.

## RBAC Permission Matrix

| Role | Vehicle Reg | Driver Mgmt | Trip/Dispatch | Maintenance | Fuel/Expense | Reports | Dashboard |
|---|---|---|---|---|---|---|---|
| Fleet Manager | Full CRUD | View + status | Dispatch/Cancel | Full CRUD | View | View | View |
| Driver | View | View (self) | Create/View (own) | — | Log fuel | — | View (own trips) |
| Safety Officer | View | Full CRUD | View (compliance) | View | — | View | View |
| Financial Analyst | View | View | View | View | Full CRUD | Full CRUD | View |

## Business Rules (must hold end-to-end)

- Vehicle `registrationNumber` is unique (DB-enforced).
- Retired/In Shop vehicles never appear in dispatch selection.
- Drivers with expired licenses or Suspended status cannot be assigned to trips.
- A driver/vehicle already On Trip cannot be assigned to another trip.
- Cargo weight must not exceed vehicle max load capacity.
- Dispatch → both vehicle and driver become On Trip.
- Complete → both return to Available.
- Cancel (dispatched) → both restore to Available.
- Create active maintenance record → vehicle becomes In Shop.
- Close maintenance → vehicle restores to Available (unless Retired).

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env      # fill in your local DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
## Git Workflow

- Feature branches off `main`, one per feature area
- `main` is protected — PR + one teammate review before merge


- Branch naming: `feature/task-XXX-short-name`
- Commit prefix: `[TASK-XXX] short description`
- `main` is protected — PR + one teammate glance before merge
