# Team Task Manager

Full-stack team task management application with role-based access control.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Axios, React Router v6
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Auth:** JWT, bcryptjs
- **UI Extras:** react-hot-toast, date-fns

## Project Structure

```
team-task-manager/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── controllers/           # Route handlers
│   ├── middleware/             # auth, roleCheck, validate
│   ├── models/                # User, Project, Task
│   ├── routes/                # API routes
│   ├── server.js              # Express entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/axios.js       # Axios instance
│   │   ├── components/        # Layout, Sidebar, Navbar, etc.
│   │   ├── context/           # AuthContext
│   │   ├── pages/             # Dashboard, Projects, Tasks, etc.
│   │   └── utils/helpers.js
│   ├── .env.example
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## Features

- **Auth:** Signup, Login, JWT-protected routes
- **Roles:** Admin (full CRUD) and Member (assigned access)
- **Projects:** Create, delete, manage members, view details
- **Tasks:** CRUD with title, description, dueDate, status (Todo/InProgress/Done), assignedTo
- **Dashboard:** Stats cards, overdue highlights, recent tasks
- **Kanban Board:** Drag-free column view per project (Todo / In Progress / Done)
- **Responsive:** Mobile sidebar, adaptive layouts

## Quick Start (Local)

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET
npm install
npm run dev
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env (VITE_API_URL=http://localhost:5000/api)
npm install
npm run dev
```

Open http://localhost:5173

## Environment Variables

### Backend (.env)
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `CLIENT_URL` | Frontend URL for CORS (comma-separated for multiple) |

### Frontend (.env)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

## Deployment

### Backend on Railway

1. Push repo to GitHub
2. Create new project on Railway → "Deploy from GitHub Repo"
3. Select the `backend` folder as root directory
4. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `PORT`
5. Railway auto-detects Node.js and runs `npm start`

### Frontend on Railway (or Vercel/Netlify)

**Railway:**
1. Add another service in the same Railway project
2. Set root directory to `frontend`
3. Build command: `npm install && npm run build`
4. Start command: `npx serve dist -s -l $PORT`
5. Add env variable: `VITE_API_URL=https://your-backend.railway.app/api`

**Netlify (alternative):**
1. Connect repo, set base directory to `frontend`
2. Build command: `npm run build`, publish: `dist`
3. Add env: `VITE_API_URL=https://your-backend.railway.app/api`

## API Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/auth/signup` | — | — | Register |
| POST | `/api/auth/login` | — | — | Login |
| GET | `/api/auth/me` | ✅ | — | Current user |
| GET | `/api/auth/users` | ✅ | — | All users list |
| GET | `/api/projects` | ✅ | — | List projects |
| POST | `/api/projects` | ✅ | Admin | Create project |
| GET | `/api/projects/:id` | ✅ | — | Project details |
| PUT | `/api/projects/:id/members` | ✅ | Admin | Update members |
| DELETE | `/api/projects/:id` | ✅ | Admin | Delete project |
| GET | `/api/tasks` | ✅ | — | List tasks (filterable) |
| POST | `/api/tasks` | ✅ | — | Create task |
| GET | `/api/tasks/:id` | ✅ | — | Task details |
| PUT | `/api/tasks/:id` | ✅ | — | Update task |
| DELETE | `/api/tasks/:id` | ✅ | — | Delete task |
| GET | `/api/dashboard` | ✅ | — | Dashboard stats |
| GET | `/api/health` | — | — | Health check |
