# Dayflow — HRMS Frontend

A Human Resource Management System frontend built with **React + Vite + Tailwind CSS**, in a warm coffee-brown theme. Covers authentication, role-based dashboards, profile management, attendance tracking, leave management, and payroll — matching the project's requirements document.

## Features

- **Real sign up / sign in** — anyone can create an account (stored in the browser via localStorage), not just demo users
- **Role-based access** — Employee and Admin/HR see different dashboards
- Employee profile, attendance (check-in/out, daily/weekly), leave requests, payroll view
- Admin employee list, attendance records, leave approvals, payroll control
- Coffee-brown minimal design with soft "popping" 3D card/button depth

## Run it locally

```bash
npm install
npm run dev
```

Then open the local URL it prints (usually `http://localhost:5173`).

## Demo logins

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@dayflow.com | admin123 |
| Employee | aditi@dayflow.com | emp123 |

Or click **Sign Up** to create a brand new account with any name/email — it will actually persist and let you log back in.

## Project structure

```
src/
  main.jsx           entry point
  App.jsx             top-level state & routing
  index.css           Tailwind + theme styles
  data/store.js        localStorage-backed data layer (users, employees, attendance, leaves)
  components/UI.jsx    shared design-system components (Button, Card, Input, Badge, etc.)
  pages/Auth.jsx       Sign In / Sign Up
  pages/Shell.jsx      sidebar layout
  pages/Employee.jsx   employee-facing pages
  pages/Admin.jsx      admin-facing pages
```

## Tech stack
React 18, Vite, Tailwind CSS, Google Fonts (Fraunces + Inter).
