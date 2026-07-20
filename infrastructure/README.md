# Infrastructure

Docker Compose orchestration for PhishGuardX is introduced at Milestone 10
(Production Readiness), per the Implementation Blueprint's development order.

Per your Milestone 0 instructions, this project currently runs via local dev
servers only (`npm run dev` for frontend/backend, `uvicorn` for the AI
service, and a locally installed MongoDB) — no Dockerfiles or
docker-compose.yml exist yet.
