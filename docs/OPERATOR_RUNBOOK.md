# ResearchFlow AI - Operator Runbook & Deployment Guide

## 1. System Requirements & Environment Variables

| Variable | Required | Description | Default |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Optional | `production` or `development` | `development` |
| `PORT` | Optional | HTTP listening port | `3000` |
| `GEMINI_API_KEY` | Optional | Gemini API key for GenAI & Search Grounding | None (Heuristic fallback used) |
| `OPENROUTER_API_KEY` | Optional | OpenRouter key for dynamic zero-cost routing | None (Fallback used) |

---

## 2. Production Deployment

### Building and Starting
```bash
# Build frontend and server bundles
npm run build

# Start production server
NODE_ENV=production node dist/server.cjs
```

### Docker Deployment
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

---

## 3. Database Persistence & Backup
- Database state is stored in `data/researchflow_db.json`.
- Writes use an atomic temporary write and rename pattern to prevent corruption during unexpected shutdowns.
- **Backup Command**:
  ```bash
  cp data/researchflow_db.json data/backups/researchflow_db_$(date +%Y%m%d_%H%M%S).json
  ```

---

## 4. Health Checks & Diagnostics
- **HTTP Health Ping**: `GET /api/health` -> returns `{ "status": "healthy" }`.
- **AI Health Status**: `GET /api/ai/health` -> returns provider statuses, latency benchmarks, and active zero-cost model count.
- **Automated Test Suite**: Run `npx tsx scripts/run-tests.ts` or `POST /api/admin/run-test-suite` to verify all 7 integration test suites.
