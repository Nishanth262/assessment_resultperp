# Fullstack Task Management API

A simple backend system that allows users to register, login, and manage their own tasks. Built with Node.js, Express, Drizzle ORM, and PostgreSQL.

## Features
- User Authentication (JWT)
- Role-based Access Control (Admin & User roles)
- Task CRUD operations
- Input validation
- Unit and API tests

## Project Structure
- `src/` (or `server/` / `shared/` in this template) - Contains application code
- `tests/` - Contains unit and API tests
- `.env.example` - Example environment variables

## Setup Instructions

1. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Environment Variables**
   Copy the `.env.example` to `.env` and set the required variables.
   Note: On Replit, these are automatically managed via the Secrets tool.
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. **Database Setup**
   Push the schema to the database:
   \`\`\`bash
   npm run db:push
   \`\`\`

## Running the Server

Start the development server:
\`\`\`bash
npm run dev
\`\`\`
The application will start on port 5000.

## Running Tests

To run the automated test suite (unit + API tests):
\`\`\`bash
npm test
\`\`\`

## Sample API Requests

**Register**
\`\`\`bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
\`\`\`

**Login**
\`\`\`bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
\`\`\`

**Create Task** (Replace `<TOKEN>` with the token from login)
\`\`\`bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title": "My first task", "description": "This is a test task", "status": "pending"}'
\`\`\`
