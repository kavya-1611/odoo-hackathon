PulseHR Backend

Backend API for PulseHR, an AI-powered HR management application.

The backend is built with Node.js, Express, Prisma, and PostgreSQL/SQLite-compatible Prisma configuration, and provides authentication, employee management, attendance, leave, payroll, and AI Copilot functionality.

Features
User signup and login
JWT-based authentication
Role-based access for Admin and Employee users
Employee profiles
Attendance management
Leave management and approvals
Payroll information
AI Copilot API
Prisma ORM for database access
Input validation using Zod
Password hashing using bcrypt
CORS configuration for frontend communication
Tech Stack
Node.js
Express.js
Prisma ORM
SQLite / configured Prisma database
JWT
bcryptjs
Zod
Google Gemini API
Nodemon
Project Structure
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── index.js
├── package.json
├── package-lock.json
└── .env
Requirements

Install the following before running the backend:

Node.js 18 or later
npm
Git
Installation

From the backend directory:

npm install

Generate the Prisma Client:

npm run prisma:generate

If the database needs to be initialized:

npm run prisma:migrate

Seed the database:

npm run prisma:seed
Environment Variables

Create a .env file inside the backend directory.

Example:

PORT=4001
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_jwt_secret"

GEMINI_API_KEY="your_gemini_api_key"

Use the actual variable names required by the current AI service implementation.

Never commit .env to GitHub.

The .env file should remain in .gitignore.

Running the Backend
Development
npm run dev

The server will normally start at:

http://localhost:4001
Production
npm start
Health Check

The backend provides a health-check endpoint:

GET /health

Example:

http://localhost:4001/health

A successful response looks similar to:

{
  "status": "ok",
  "timestamp": "2026-08-22T09:05:22.969Z"
}
Authentication
Signup
POST /api/auth/signup

Example request:

{
  "employeeId": "EMP001",
  "email": "employee@example.com",
  "password": "Password123",
  "fullName": "Employee Name",
  "role": "EMPLOYEE"
}

The response includes a JWT token.

Login
POST /api/auth/login

Example request:

{
  "email": "employee@example.com",
  "password": "Password123"
}

The returned JWT should be sent with protected API requests:

Authorization: Bearer <JWT_TOKEN>
Current User
GET /api/auth/me

Requires authentication.

AI Copilot

The backend exposes an AI Copilot endpoint:

POST /api/ai/chat

Example request:

{
  "message": "What is my attendance?"
}

The endpoint requires a valid authenticated user.

The AI service uses the configured Google Gemini API credentials.

Available Scripts

Run:

npm run

Available scripts include:

npm start
npm run dev
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run setup
npm run dev

Starts the backend with Nodemon.

npm start

Starts the backend with Node.js.

npm run prisma:generate

Generates the Prisma Client.

npm run prisma:migrate

Runs Prisma database migrations.

npm run prisma:seed

Seeds initial application data.

npm run setup

Installs dependencies, initializes the database, and seeds the database.

API Authentication

Protected endpoints require:

Authorization: Bearer <JWT_TOKEN>

If the authorization header is missing or malformed, the API returns an authentication error.

Development Notes

The backend is designed to run alongside the PulseHR frontend.

Typical local development setup:

Frontend
http://localhost:5173

Backend
http://localhost:4001

The frontend should be configured to send API requests to the backend URL.

Security

Do not commit any of the following:

.env
node_modules/
*.db

API keys, JWT secrets, database credentials, and other sensitive configuration values must be stored in environment variables.

Troubleshooting
Port already in use

If you see:

EADDRINUSE: address already in use :::4001

another process is already using port 4001.

On Windows, find the process:

netstat -ano | findstr :4001

Then terminate the process if necessary:

taskkill /PID <PID> /F

Alternatively, stop the existing Node.js development server with:

Ctrl+C
Prisma EPERM error

If Prisma reports an error such as:

EPERM: operation not permitted, rename ...query_engine-windows.dll.node

a running Node.js process may be locking the Prisma engine.

Stop the running Node processes and retry:

taskkill /IM node.exe /F
npm run prisma:generate
AI API authentication error

If the AI endpoint returns an API authentication error, verify that the correct Gemini API key is configured in the backend .env file and that the environment variable name matches the AI service implementation.

After changing .env, restart the backend.

Project Status

The backend provides the core API layer for the PulseHR HR management platform, including authentication, employee operations, attendance, leave, payroll, and AI Copilot functionality.

For deployment, configure production environment variables, database settings, CORS, and the frontend API URL appropriately.
