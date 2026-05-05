# Team Task Manager

A full-stack, role-based task management application built with React, Node.js, and PostgreSQL.

## 🚀 Live Demo
**URL:** [https://task-manager-production-8b85.up.railway.app](https://task-manager-production-8b85.up.railway.app)

## ✨ Features

### Authentication & Authorization
- **JWT-based Authentication:** Secure signup and login.
- **Role-Based Access Control (RBAC):**
  - **Admin:** Can create/delete projects, invite members, assign tasks, and view all dashboards.
  - **Member:** Can view assigned projects, create tasks within projects, and update their own task status.

### Core Functionality
- **Projects:** Full CRUD for projects including name, description, and team members.
- **Tasks:** 
  - Create tasks under projects.
  - Assign tasks to specific members.
  - Set due dates and priorities (Low, Medium, High).
  - Track status (Pending, In Progress, Done).
- **Dashboard:** Per-project analytics showing total tasks, status breakdown, and overdue tracking.

## 🛠 Tech Stack
- **Frontend:** React, Vite, Vanilla CSS (Premium Modern UI).
- **Backend:** Node.js, Express, REST API.
- **Database:** PostgreSQL (with Prisma ORM).
- **Deployment:** Railway (Dockerized).

## 📦 Project Structure
- `/frontend`: React application (Vite).
- `/backend`: Express API and Prisma schema.
- `Dockerfile`: Multi-stage Docker build for unified deployment.

## ⚙️ Setup & Installation

### Local Development
1. **Clone the repository:**
   ```bash
   git clone https://github.com/Gunjan-Raghav/Task-Manager.git
   cd Task-Manager
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Configure .env with DATABASE_URL and JWT_SECRET
   npx prisma db push
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Deployment to Railway
The project is optimized for Railway using Docker.
1. Connect your GitHub repository to Railway.
2. Add the following Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `JWT_SECRET`: A secure secret for tokens.
   - `PORT`: 4000.
3. Railway will automatically build and deploy the app.

## 📄 License
MIT
