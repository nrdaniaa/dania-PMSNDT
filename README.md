# Project-NDT (NDT Project Management System)

Project-NDT is a Next.js-based project management system for Non-Destructive Testing (NDT) workflows. It includes:

- User authentication with Prisma and JWT
- Email verification utilities (nodemailer)
- A normalized Prisma schema for NDT qualifications, reports and edit history

## Repository layout

- `app/` – Next.js app routes and pages
- `prisma/` – Prisma schema (`schema.prisma`)
- `src/app/api/auth` – authentication endpoints
- `src/lib/` – helpers (Prisma client, mailer, JWT helpers)

## Quick start

1. Install dependencies

```powershell
cd Project-NDT
npm install
```

2. Create a `.env` file at the repository root with at least the following variables:

```env
DATABASE_URL="mysql://<DB_USER>:<PASSWORD>@<HOST>:3306/<DB_NAME>"
JWT_SECRET="a-long-random-secret"
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="smtp-user"
SMTP_PASS="smtp-pass"
EMAIL_FROM="no-reply@example.com"
```

If your DB password includes special characters, percent-encode it.

3. Generate Prisma client

```powershell
npx prisma generate --schema ./prisma/schema.prisma
```

4. Sync schema to the database (development)

For a fresh database (creates tables):

```powershell
npx prisma db push --schema ./prisma/schema.prisma
```

If you want Prisma Migrate management (recommended for production):

```powershell
# create migration files only
npx prisma migrate dev --schema ./prisma/schema.prisma --name init --create-only
# then mark the migration as applied (replace <folder-name>)
npx prisma migrate resolve --schema ./prisma/schema.prisma --applied "<folder-name>"
```

5. Start the dev server

```powershell
npm run dev
```

Open http://localhost:3000

## Notes and tips

- The Prisma schema uses `@@map` mappings to preserve existing table names created by previous `db push` runs. Removing or changing these without planning migrations can cause schema drift.
- If your MariaDB user cannot create databases, set `SHADOW_DATABASE_URL` in `.env` to a shadow DB that the user can access before running `prisma migrate dev`.
- Always back up your DB before running migrations on production.

## Pushed repo

This code was pushed to: `https://github.com/MGreyH/NDT-PMS.git` (main branch).

## Next steps I can help with

- Baseline Prisma Migrate (create-only migration + resolve)
- Add seed scripts and tests
- Wire SMTP credentials for registration verification emails

Tell me which next step you'd like and I'll implement it.
