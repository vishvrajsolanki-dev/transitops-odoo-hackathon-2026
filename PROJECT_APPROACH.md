# TransitOps — Finalized Idea, Approach & Locked Decisions

> **How to use this file**: Anyone starting a task session should paste, in order: (1) the original problem statement, (2) this entire file, (3) their `STARK TASK HANDOUT` block. This gives STARK full project context before it plans or codes anything — no re-explaining needed.

---

## 1. Original Problem Statement (Summary)

TransitOps is an 8-hour hackathon build: a centralized transport operations platform digitizing vehicle, driver, dispatch, maintenance, and expense management for logistics companies currently relying on spreadsheets and manual logbooks.

**Target users**: Fleet Manager (fleet assets, maintenance, lifecycle), Driver (creates trips, monitors deliveries), Safety Officer (driver compliance, license validity, safety scores), Financial Analyst (expenses, fuel, costs, profitability).

**Core functional scope (from the original spec)**:
- Auth with RBAC, only authenticated users access the app
- Dashboard with KPIs (Active/Available Vehicles, In Maintenance, Active/Pending Trips, Drivers On Duty, Fleet Utilization %) + filters by vehicle type/status/region
- Vehicle Registry: Registration Number (unique), Model, Type, Max Load Capacity, Odometer, Acquisition Cost, Status (Available/On Trip/In Shop/Retired)
- Driver Management: Name, License Number/Category/Expiry, Contact, Safety Score, Status (Available/On Trip/Off Duty/Suspended)
- Trip Management: source, destination, vehicle, driver, cargo weight, planned distance. Lifecycle: Draft → Dispatched → Completed → Cancelled
- Maintenance: creating a record auto-switches vehicle to In Shop, removing it from dispatch pool
- Fuel & Expense: fuel logs (liters/cost/date) + other expenses (tolls, maintenance); auto-computed total operational cost per vehicle
- Reports & Analytics: Fuel Efficiency, Fleet Utilization, Operational Cost, Vehicle ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost; CSV export mandatory, PDF export optional
- **Mandatory business rules**: unique registration number; Retired/In Shop vehicles never dispatchable; expired-license or Suspended drivers cannot be assigned; a vehicle/driver already On Trip cannot be double-booked; cargo weight ≤ max load capacity; dispatch → both On Trip; complete → both Available; cancel (dispatched) → both restore to Available; open maintenance → vehicle In Shop; close maintenance → vehicle Available (unless Retired)
- **Bonus (explicitly optional per spec, deferred)**: PDF export, email reminders for expiring licenses, vehicle document management, dark mode, advanced search/sort

---

## 2. Gaps Found & How They Were Resolved (not bypassed)

| Gap/Ambiguity | Resolution — now part of the core build |
|---|---|
| ROI formula needs `Revenue`, no such field existed | Added `revenue` (Decimal, nullable) to the Trip entity, captured at trip completion. Reports/ROI reads this — real input, not a placeholder. |
| Safety Score defined but no rule ever updates it | Safety Officer gets a manual edit control (PATCH endpoint) with a mandatory reason, logged to a new `SafetyScoreLog` table (audit trail: old score, new score, reason, who changed it, when). |
| License Category stored but unused by any rule | Confirmed intentional — it's a maintained profile field per spec, not required to gate anything. No fix needed. |
| RBAC required, no permission matrix existed | Full matrix locked (Section 4 below) — enforced via one shared `checkPermission(module, action)` middleware, not scattered per-route checks. |
| Ambiguous: who creates/dispatches trips? | Locked per the spec's own wording (Section 2): **Driver creates trips**; **Fleet Manager can also dispatch/cancel** on their behalf. |
| Dashboard filters (type/status/region) | Confirmed Tier-1/mandatory (spec 3.2) — not traded away for anything else. |

**Governing rule for this project**: nothing in the original mandatory spec (sections 3.1–3.8, plus the Mandatory Business Rules) gets cut, downgraded, or silently replaced to make room for enhancements. Gaps get fixed *within* the core; new ideas stack *on top* of it.

---

## 3. The Unique Angle (Locked Differentiator)

**Live State-Machine Visualizer** — an additive dashboard panel that renders every vehicle and driver as a node in an animated status graph (Available → On Trip → In Shop/Off Duty/Suspended, etc.), which visibly transitions in real time the instant a trip is dispatched/completed/cancelled or a maintenance record opens/closes.

- It subscribes to the *same* status fields already exposed by the core CRUD/trip/maintenance endpoints — no new data source, no parallel system.
- It does **not** replace the KPI cards, tables, or filters from the original spec — it's an extra panel alongside them.
- Purpose: makes the hardest, most invisible part of the system (the business-rule engine enforcing all the Mandatory Business Rules) visible and demo-able in the first 90 seconds for judges.
- If time runs short, this is the *only* thing allowed to shrink (fewer animation states) — never a Tier-1 spec item.

---

## 4. Locked RBAC Permission Matrix

| Role | Vehicle Reg | Driver Mgmt | Trip/Dispatch | Maintenance | Fuel/Expense | Reports | Dashboard |
|---|---|---|---|---|---|---|---|
| Fleet Manager | Full CRUD | View + status | Dispatch/Cancel | Full CRUD | View | View | View |
| Driver | View | View (self) | Create/View (own) | — | Log fuel | — | View (own trips) |
| Safety Officer | View | Full CRUD | View (compliance) | View | — | View | View |
| Financial Analyst | View | View | View | View | Full CRUD | Full CRUD | View |

Enforced through a single middleware: `checkPermission(module, action)`. No per-route ad hoc permission logic.

---

## 5. Stack & Architecture Decisions (Locked)

| Layer | Choice | Why |
|---|---|---|
| Backend | Node.js + Express | Fastest CRUD-to-working-endpoint ratio for an 8h window |
| ORM/DB | Prisma + PostgreSQL | Type-safe queries, one schema file two backend people can't silently diverge on |
| Frontend | React (Vite) + Tailwind | Fast iteration, utility-first styling under time pressure |
| Auth | JWT, payload `{ userId, role, iat, exp }` | Stateless, simple to verify across modules; token kept in memory/context, never localStorage |

**Repo structure** (see `README.md` in repo root for the full tree): `backend/src/modules/{auth,vehicles,drivers,trips,maintenance,fuel-expense,reports}` each with `controller.js` / `routes.js` / `service.js`; `frontend/src/pages/<module>` mirrors it; `backend/prisma/schema.prisma` is the single source of truth for all tables.

**Naming conventions**: files/folders `kebab-case`; React components `PascalCase`; JS vars/functions `camelCase`; DB columns/tables `snake_case`; API routes `kebab-case` plural.

**API response envelope** (mandatory for every endpoint):
```json
Success: { "success": true, "data": {...} }
Error:   { "success": false, "error": { "code": "STRING_CODE", "message": "human readable" } }
```

**Git workflow**: branch `feature/task-XXX-short-name`; commit prefix `[TASK-XXX] short description`; `main` protected, PR + one teammate glance before merge.

---

## 6. Locked Interface Contracts

```
Field: vehicleStatus / driverStatus
  Frontend (JS/TS)      : "Available" | "OnTrip" | "InShop" | "Retired" (vehicle)
                           "Available" | "OnTrip" | "OffDuty" | "Suspended" (driver)
  Backend (API payload)  : snake_case enum — available, on_trip, in_shop, retired / available, on_trip, off_duty, suspended
  Database column        : status (enum)
  Conversion point        : one status-mapping service function owns all auto-transitions
                           (dispatch/complete/cancel/maintenance-open/maintenance-close) —
                           no other file mutates this field directly

Field: revenuePerTrip
  Frontend               : revenue: number (entered at trip completion)
  Backend                : revenue
  Database column         : trips.revenue
  Conversion point         : trip-completion endpoint only writes it; Reports module only reads it

Field: role_permissions
  See the RBAC matrix in Section 4 — enforced via checkPermission(module, action) middleware,
  the single source of truth for all permission checks
```

---

## 7. Full Task Roadmap (Reference)

| Task | Domain | Scope | Tier | Time Box | Depends On |
|---|---|---|---|---|---|
| TASK-001A | DB | Full Prisma schema, migration, seed skeleton | 1 | 1.5h split | None |
| TASK-001B | Backend | Auth (login/register/JWT), checkPermission stub | 1 | 1.5h split | TASK-001A (Users/Roles) |
| TASK-002A | Backend | Vehicle Registry CRUD API + filters | 1 | 1h split | TASK-001A/B |
| TASK-002B | Backend | Driver Mgmt CRUD API + safety-score endpoint | 1 | 1h split | TASK-001A/B |
| TASK-003 | Frontend/Backend | Full RBAC matrix + Auth UI + base layout | 1 | 1.25h | TASK-001 |
| TASK-004 | Backend | Trip/Dispatch rule engine (hardest task) | 1 | 1.5h | TASK-002 |
| TASK-005 | Backend | Maintenance workflow + Fuel/Expense logging | 1 | 1h | TASK-004 |
| TASK-006 | Frontend | Registry UI + Trip creation form | 1 | 1.5h | TASK-002, 003 |
| TASK-007 | Backend | Reports/Analytics endpoints (incl. ROI) | 1 | 1h | TASK-004, 005 |
| TASK-008 | Frontend | Dashboard KPIs + filters + CSV export | 1 | 1h | TASK-007 |
| TASK-009 | Frontend | Live State-Machine Visualizer (unique angle) | 2 | 0.75h | TASK-004, 006, 008 |
| TASK-010 | All | Integration, seed data, demo rehearsal | 1 | 0.5h | TASK-007, 008, 009 |

**Total critical path**: 8.0h vs 8h available — ⚠️ tight, zero buffer. TASK-009 is the only item allowed to shrink under time pressure.

---

## 8. What "Done" Looks Like

The Section 5 example workflow from the original spec runs live, end-to-end, without manual DB edits:
register vehicle → register driver → create trip (cargo ≤ capacity) → dispatch (both go On Trip) → complete (both return Available, revenue entered) → create maintenance record (vehicle → In Shop, hidden from dispatch) → Reports/Dashboard reflect the latest trip and fuel log — **and** the State-Machine Visualizer shows every one of those transitions animate live, in the same tab, without a page refresh.
