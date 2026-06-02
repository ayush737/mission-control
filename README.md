# Mission Control

A self-hosted web application for a software engineer who wants to get debt-free, level up skills, stay fit, and build a path toward moving abroad.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Prisma
- SQLite
- Docker
- Docker Compose
- Nginx

## Features

- Home dashboard with mission, progress, Big Three, money snapshot, habits, and study tracker
- Finance page with EMI tracking, credit cards, bills, debt snowball strategy, projected debt-free date, and cash flow forecast
- Career page with skill progress, notes, study hours, and weekly report
- Focus page with a minimal full-screen Pomodoro timer
- Weekly review with wins, losses, money saved, hours studied, gym sessions, and focus score

## Local Development

1. Copy `.env.example` to `.env`.
2. Install dependencies:

```bash
npm install
```

3. Push the Prisma schema to SQLite:

```bash
npm run db:push
```

4. Seed the starter data:

```bash
npm run db:seed
```

5. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Docker Deployment

1. Copy `.env.example` to `.env`.
2. Build and start the stack:

```bash
docker compose up -d --build
```

The application is served through Nginx on port `80`.

## Raspberry Pi 4 Notes

- Use a 64-bit Raspberry Pi OS image if possible.
- The Dockerfile uses `node:20-bookworm-slim`, which has ARM support.
- SQLite data is stored in the named volume `mission-control-data` at `/data`.
- If you want backups, copy the SQLite file from the mounted Docker volume regularly.

## Data Model

Prisma stores:

- app configuration and mission state
- money snapshot
- Big Three tasks
- habits and habit logs
- skills and study logs
- EMIs
- credit cards
- bills
- focus sessions
- weekly review notes

## Useful Commands

```bash
npm run prisma:studio
npm run db:push
npm run db:seed
```
