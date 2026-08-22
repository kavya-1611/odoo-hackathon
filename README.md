# PulseHR — AI-Native HRMS

An HRMS where the AI doesn't just store your data — it acts on it. Employees apply for leave and check attendance through a conversational Copilot; admins get a daily AI-written briefing and AI-assisted approval recommendations instead of scrolling raw tables.

Built with **Node.js/Express + Prisma/SQLite** (backend) and **React + Vite + Tailwind** (frontend), with **Claude API function-calling** as the AI layer.

---

## Features

- Secure signup/login with role-based access (Admin vs Employee)
- Employee profile management (self-edit limited fields, admin edits everything)
- Attendance check-in/check-out + daily/weekly views
- Leave application, approval/rejection workflow with admin comments
- Payroll view (read-only for employees, editable by admin)
- **AI Copilot chat** — apply leave / check attendance in plain English
- **AI Pulse Briefing** — auto-generated daily summary on the admin dashboard
- **AI Smart Approve** — explainable approve/reject recommendation per leave request

---

## Project Structure

```
pulsehr/
├── backend/          Express API + Prisma (SQLite) + Claude AI orchestration
├── frontend/         React + Vite + Tailwind SPA
└── .vscode/          Debug configs & tasks for VS Code
```

---

## Prerequisites

- Node.js 18+ and npm
- (Optional) An [Anthropic API key](https://console.anthropic.com) to enable the AI features — the app runs fine without one, with AI routes returning a friendly fallback message instead of crashing.

---

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

The API starts on **http://localhost:4000**. Verify it's up:
```bash
curl http://localhost:4000/health
```

To enable AI features, add your key to `backend/.env`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Frontend

In a second terminal:
```bash
cd frontend
npm install
npm run dev
```

The app starts on **http://localhost:5173** and proxies `/api` calls to the backend automatically (see `vite.config.js`).

### 3. Log in with demo accounts (created by the seed script)

| Role | Email | Password |
|---|---|---|
| Admin | admin@pulsehr.com | Password123! |
| Employee | emp-1002@pulsehr.com | Password123! |

---

## Using VS Code

This repo ships with `.vscode/launch.json` and `.vscode/tasks.json`.

- **Run Task** (`Ctrl+Shift+P` → "Tasks: Run Task") → **"Backend: Install & Setup (migrate + seed)"** once, then **"Run Full Stack (Backend + Frontend)"** to start both dev servers together.
- **Run and Debug** (`F5`) → select **"Debug Full Stack"** to launch the backend with breakpoint support and open the frontend in a debuggable Chrome instance simultaneously.

---

## Trying the AI Features

1. Log in as an employee, click the chat bubble bottom-right, and type: *"Apply 2 days sick leave starting next Monday"*. The Copilot parses the request and files it via a real database write (visible immediately on the Leave page).
2. Log in as admin (`admin@pulsehr.com`) — the dashboard opens with an AI-generated Pulse Briefing summarizing pending approvals and today's absences.
3. On the Leave Approvals page, click **"Get AI Suggestion"** next to a pending request to see an explainable Approve/Reject recommendation.

All three fall back to a plain, honest message ("AI not configured — add an API key") if `ANTHROPIC_API_KEY` isn't set, so the rest of the app is always fully functional.

---

## Switching to PostgreSQL (optional, for production)

The Prisma schema defaults to SQLite for zero-config local dev. To use Postgres instead:

1. In `backend/prisma/schema.prisma`, change:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. In `backend/.env`, set:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/pulsehr"
   ```
3. Re-run `npx prisma migrate dev --name init`.

---

## Architecture Notes

- **The AI never touches the database directly.** Claude is only given typed "tools" (`apply_leave`, `get_my_attendance`, etc.) via function-calling; the backend validates and executes the actual Prisma mutation, then returns the result to Claude to summarize. This keeps every AI-driven action auditable and permission-scoped to the authenticated user — see `backend/src/services/ai.service.js`.
- **Role-based middleware** (`authGuard` + `roleGuard`) protects every route; employees can never reach admin-only endpoints regardless of what the AI is asked to do.
- **Validation** is enforced at the API boundary via Zod schemas before anything reaches the database.

---

## What's Next (Roadmap)

- Real email verification on signup (currently `isVerified` defaults to `true` for demo speed)
- A dedicated `GET /api/users` endpoint for a full employee directory (Admin > Employees currently derives its list from leave records)
- Attendance anomaly/risk scoring
- PDF payslip generation
- Notification center (in-app + email)
- Analytics & reports dashboard (attendance %, leave trends)

## License

MIT — free to use, modify, and build on for your own hackathon or product.
