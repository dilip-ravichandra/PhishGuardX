# PhishGuardX

AI-powered enterprise email phishing detection platform.

Full architecture and requirements documentation lives in [`docs/`](./docs) —
start with `docs/README.md`, then `docs/PROJECT_MASTER_INDEX.md`, then
`docs/IMPLEMENTATION_GUIDE.md` before touching any code.

## Current status

**Milestone 0 — Project Initialization.** Scaffolding only: no business
logic, no auth, no scanning pipeline yet. Each service boots independently
and the frontend confirms connectivity to the backend's health endpoint.

## Repository layout

```
frontend/        React + Vite + TypeScript SPA
backend/          Node.js + Express + TypeScript API
ai-service/       Python + FastAPI AI inference microservice
extension/        Chrome Extension (not yet implemented - Milestone 8)
infrastructure/   Docker Compose orchestration (not yet implemented - Milestone 10)
shared/           Cross-service TypeScript types
docs/             Frozen architecture & requirements documentation
```

## Running locally (Milestone 0)

Requires Node.js 22+, Python 3.11+, and a local MongoDB instance (not yet
used by any code, but expected by later milestones).

**Backend**
```bash
cd backend
cp .env.example .env
npm install
npm run dev        # http://localhost:4000
```

**Frontend**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev         # http://localhost:5173
```

**AI service**
```bash
cd ai-service
cp .env.example .env
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000   # http://localhost:8000
```

Or, from the repo root, using the npm workspace scripts:
```bash
npm install
npm run dev:backend
npm run dev:frontend
```

## Verifying the setup

- Backend health: `curl http://localhost:4000/api/v1/health`
- AI service health: `curl http://localhost:8000/api/v1/health`
- Frontend: open `http://localhost:5173` — it should show the backend
  connectivity status.

## Tests

```bash
npm run test:backend
```
