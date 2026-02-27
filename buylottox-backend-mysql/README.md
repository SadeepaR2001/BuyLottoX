# BuyLottoX Backend (NestJS + Prisma + MySQL)

## Requirements
- Node.js 18+
- MySQL 8+ (or compatible)

## Setup
1) Install dependencies
```bash
npm install
```

2) Create a database in MySQL (example)
```sql
CREATE DATABASE buylottox;
```

3) Configure env
```bash
cp .env.example .env
```
Edit `DATABASE_URL` in `.env` to match your MySQL user/password/host/db.

4) Run migrations + seed
```bash
npm run prisma:migrate
npm run db:seed
```

5) Start API
```bash
npm run start:dev
```

- API: http://localhost:4000
- CORS allowed: http://localhost:5173

## Demo accounts (seed)
- Admin: admin@buylottox.test / admin123
- User:  user@buylottox.test / user1234
