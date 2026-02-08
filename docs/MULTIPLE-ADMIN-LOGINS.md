# Multiple login access (e.g. marketing team)

You can give multiple people their own login to the admin dashboard without adding a full user database.

---

## How it works

- **Single main admin:** `ADMIN_PASSWORD` (or the built-in fallback) – one shared “owner” password.
- **Extra logins:** `ADMIN_PASSWORDS` or `MARKETING_PASSWORDS` – comma-separated list of additional passwords. Each person gets one password from this list.

Anyone who enters **any** of these passwords at `/login` gets access to the same admin dashboard. The app does **not** track who is who (no usernames or per-user roles yet).

---

## Setup

### 1. Add marketing team passwords in `.env` or `.env.local`

```bash
# Main admin (you)
ADMIN_PASSWORD=your_secure_main_password

# Marketing team – one password per person (comma-separated, no spaces)
ADMIN_PASSWORDS=marketing_alice_secret,marketing_bob_secret,marketing_carol_secret
```

Or use a separate name if you prefer:

```bash
MARKETING_PASSWORDS=marketing_alice_secret,marketing_bob_secret,marketing_carol_secret
```

Both `ADMIN_PASSWORDS` and `MARKETING_PASSWORDS` are read; you can use one or both.

### 2. Give each person their password

- **Alice** → `marketing_alice_secret`
- **Bob** → `marketing_bob_secret`
- **Carol** → `marketing_carol_secret`

They go to `/login`, enter their password, and get full admin access (same as main admin today).

### Named passwords (track who logged in)

To attribute logins to a specific person (e.g. for tracking), use a dedicated env var. When that password is used, the server logs their name and can return it to the UI.

**Daniel Tonkopi (marketing):**

1. In `.env` or `.env.local` add:
   ```bash
   DANIEL_TONKOPI_PASSWORD=<password you give to Daniel>
   ```
2. Give Daniel his password (see below). Only he should have it.
3. When Daniel logs in, the server will log `[Admin login] Daniel Tonkopi` so you can track his access.

**Password for Daniel Tonkopi:**

```
Jg-DT!2025#7k
```

This password is **built in** by default, so Daniel can log in at `/login` without any env setup. Give him this password privately.

To use a different password for Daniel (e.g. in production), set in `.env` or `.env.local`:

```bash
DANIEL_TONKOPI_PASSWORD=your_custom_password_for_daniel
```

His logins are logged as `[Admin login] Daniel Tonkopi` in server logs.

### 3. Revoke access

- Remove that person’s password from `ADMIN_PASSWORDS` / `MARKETING_PASSWORDS` in `.env`, then restart the app. They can no longer log in with that password.

---

## Security notes

- Use strong, unique passwords per person.
- Don’t commit `.env` / `.env.local` to git (they should already be in `.gitignore`).
- In production, consider moving to a proper auth system (e.g. NextAuth, Clerk, Auth0) with real user accounts and roles if you need per-user identity or different permissions (e.g. “marketing” vs “admin”).

---

## Future: per-user accounts and roles

Right now there are no usernames or roles – only “logged in” vs “not logged in.” To add:

- **Per-user identity** (who did what)
- **Roles** (e.g. marketing vs full admin)
- **Invite/revoke by email**

you’d add something like:

- An `admin_users` table (email, password hash, role) and login by email + password, or
- An auth provider (NextAuth, Clerk, Auth0) with multiple users and optional roles.

The current multi-password approach is a simple way to give your marketing team their own logins without changing the rest of the app.
