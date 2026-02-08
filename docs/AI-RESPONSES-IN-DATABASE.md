# AI responses in the database

## Table: `lead_responses`

AI-generated replies to leads are stored in **`lead_responses`**. Each row is one response (one message sent to a lead).

---

## Schema (two variants in codebase)

The codebase uses **two column naming conventions** depending on where the data came from:

| Column (import/Express) | Column (Next.js) | Description |
|-------------------------|------------------|-------------|
| `response_content`      | `response_text`  | The AI reply body (full text) |
| `platform`              | —                | Where the response was sent (e.g. reddit) |
| `response_type`         | —                | Type of response (e.g. intelligent_agent, aggressive_conversion, citizenship, h1b) |
| `status`                | —                | e.g. posted, failed |
| `posted_at`             | —                | When the response was posted |
| `created_at`            | `created_at`     | When the row was created |
| `response_url`          | `response_url`   | Link included in the response |
| `response_slot`        | `response_slot`  | Sequence number for multiple responses per lead |
| `lead_id`               | `lead_id`        | FK to `leads.id` |
| `id`                    | `id`             | Primary key |
| `post_id`               | —                | External post ID (optional) |

- **Import / Express / production data** (e.g. `data/lead_responses.json`, `server/scripts/import-responses-from-csv.js`, `server/storage.ts`): uses **`response_content`**, **`platform`**, **`response_type`**, **`status`**, **`posted_at`**.
- **Next.js generate-response** (`app/api/leads/[id]/generate-response/route.ts`): writes **`response_text`**, **`response_url`**, **`response_slot`**, **`created_at`**. It does **not** set `platform`, `response_type`, or `status`.

So the actual DB may have **`response_content`** (if populated from import) or **`response_text`** (if only Next.js has written to it). Use the appropriate column when querying.

---

## How to inspect AI responses

1. **Sample via API**  
   `GET /api/leads/ai-responses?limit=20&offset=0`  
   Returns a list of AI responses with lead context. The route supports both `response_content` and `response_text` (tries one, falls back to the other if the column is missing).

2. **By lead**  
   `GET /api/leads/[id]/responses`  
   Returns all responses for one lead. This route selects **`response_text`**; if your table only has **`response_content`**, you may need to align the route or add a view/alias.

3. **Raw SQL (response body)**  
   - If table has **`response_content`**:
     ```sql
     SELECT id, lead_id, response_content, platform, response_type, status, created_at
     FROM lead_responses
     ORDER BY created_at DESC
     LIMIT 50;
     ```
   - If table has **`response_text`**:
     ```sql
     SELECT id, lead_id, response_text, response_url, response_slot, created_at
     FROM lead_responses
     ORDER BY created_at DESC
     LIMIT 50;
     ```

---

## What we store vs what we don’t

- **Stored:** Response body, platform, response_type (when set), status, posted_at, created_at, response_url, response_slot, lead_id.
- **Not stored:** Whether the **user asked** about an alternative pathway; whether the **AI suggested** an alternative; whether the user **engaged** with a suggestion (e.g. clicked, replied). So “pathway discovery” or “user asked vs AI suggested” cannot be derived from this table alone.

---

## Response types (from import data)

From `data/lead_responses.json`, **`response_type`** includes:

- `intelligent_agent`
- `aggressive_conversion`

Express/storage also uses: `citizenship`, `h1b`, `green_card`, `family`, `general`, `urgency_boost` for analytics.
