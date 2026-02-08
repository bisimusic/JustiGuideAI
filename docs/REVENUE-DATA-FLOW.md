# Revenue analytics – where data comes from

## Overview

Revenue data for the **Revenue Analytics** tab (Admin → Investor Relations → Revenue Analytics) can be served from **two** places:

| Source | When it’s used | Database |
|--------|----------------|----------|
| **Next.js API** `GET /api/revenue/analytics` | Default when you run `npm run dev` (Next.js only). Same host, so the app calls this route. | **Direct:** `lib/db.ts` → `DATABASE_URL` (Neon/Postgres) |
| **Express API** `GET /api/revenue/analytics` | Only when the frontend is configured to call the Express base URL (e.g. `EXPRESS_SERVER_URL`). | **Via storage:** Express `server/storage.ts` → same `DATABASE_URL` |

Both read from the **same database** (`leads`, `lead_responses`). The Next.js route does not depend on the Express server.

---

## Next.js route (recommended for single-server use)

**File:** `app/api/revenue/analytics/route.ts`

**Data flow:**

1. **`lib/db.ts`**  
   - `dbQueries.getTotalLeads()` → `SELECT COUNT(*) FROM leads`  
   - `dbQueries.getTotalResponses()` → `SELECT COUNT(*) FROM lead_responses`  
   - `dbQueries.getLeadsWithResponses()` → `COUNT(DISTINCT lead_id) FROM lead_responses`

2. **Same file (direct SQL via `dbClient`)**  
   - Average AI score: `AVG(ai_score) FROM leads`  
   - Platform breakdown: `GROUP BY source_platform` on `leads`  
   - Validated count: `COUNT(*) FILTER (WHERE is_validated) FROM leads`  
   - Service-type counts: inferred from `leads.title` (e.g. N-400, H-1B, family → `d2c_n400`, `b2b_*`)  
   - High-value leads: `SELECT ... FROM leads ORDER BY ai_score DESC LIMIT 10`

3. **Derived in the route**  
   - `serviceBreakdown`, `revenueMetrics`, `conversionFunnel`, `avgLeadValue` are computed from the above (counts × revenue per case, conversion assumptions).

**Env:** `DATABASE_URL` must be set (Neon or Postgres). No Express env needed.

---

## Express route (legacy / when using Express)

**File:** `server/routes.ts` → `app.get("/api/revenue/analytics", ...)`

**Data flow:**

1. **`server/storage.ts`** (Drizzle, same `DATABASE_URL`)  
   - `storage.getLeads(50)` – sample of leads  
   - `storage.getDashboardStats()` – totalLeads, avgAiScore, validated %, etc.  
   - `storage.getResponseTotals()` – total responses, leads with responses  
   - `storage.getRevenueAggregates()` – uses `getLeads(10000)` + `getAllLeadResponses()` for revenue calc

2. **`server/services/revenue-calculator`** (if present)  
   - `calculateRevenueFromAggregates(revenueAggregates)`  
   - `getHighValueLeads(leads, 6)`

3. Response shape is built in `server/routes.ts` from storage + calculator.

**Env:** `DATABASE_URL` for storage; Express server must be running (e.g. `npm run server`) if the app is configured to call it.

---

## Connecting the dashboard to the database

- **Using Next.js only:**  
  The dashboard already calls `fetch('/api/revenue/analytics')`. That hits **Next.js** `app/api/revenue/analytics/route.ts`, which uses **only** `lib/db.ts` and `DATABASE_URL`. No extra “connection” step; just ensure `DATABASE_URL` is set in `.env` / `.env.local`.

- **Using Express:**  
  Point the app at the Express base URL (e.g. via `EXPRESS_SERVER_URL` or proxy). Then revenue analytics is served by Express and still reads from the same DB via `server/storage.ts`.

---

## Lead composition (breakdown) – separate endpoint

**File:** `app/api/dashboard/lead-composition/route.ts`

**Used by:** The “Current Lead Breakdown” card on the same Revenue Analytics tab.

**Data:** Same DB via `lib/db.ts`: total leads, by AI score bucket, by platform, by visa category (inferred from title). No Express dependency.
