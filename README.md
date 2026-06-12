# AI Analytics SaaS — Full Stack Project

## Structure
```
project/
├── frontend/   React + Vite + Tailwind
└── backend/    Express + MongoDB + Mongoose
```

## Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, EMAIL credentials
npm run dev
```

## API Endpoints
| Method | Route | Auth |
|--------|-------|------|
| POST | /api/auth/signup | No |
| POST | /api/auth/login | No |
| POST | /api/auth/forgot-password | No |
| POST | /api/dataset/upload | Yes |
| GET | /api/dataset/history | Yes |
| DELETE | /api/dataset/:id | Yes |
| POST | /api/analyze | Yes |
| GET | /api/subscription/plans | No |
| POST | /api/subscription/subscribe | Yes |
| GET | /api/subscription/status | Yes |
