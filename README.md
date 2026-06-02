# Mission Control

A self-hosted web application for finance, career, fitness, focus, and now automated daily missions.

## Daily Mission Generator

Mission Control generates a daily mission automatically when the dashboard loads. A background cron worker also creates the next day’s mission at midnight.

### Current profile used by the generator

- Name: Ayush
- Role: SDET 2
- Emergency Fund Target: ₹100000
- Current Emergency Fund: ₹25000
- Total Debt: ₹180000
- Monthly Salary: ₹XXXXX
- Target Country: Germany
- Target Date: Dec 2027

## Deployment

If you are using Docker Compose:

```bash
git pull origin main
sudo docker compose down
sudo docker compose up -d --build
```

The app is exposed on port `8082`.
