Prisma setup added.

Steps to initialize locally:
1. npm install
2. npx prisma generate
3. npx prisma migrate dev --name init

Environment:
- Ensure DATABASE_URL is correct in `.env`.
- Set NEXT_PUBLIC_BASE_URL to your app URL for verification links.

