# ResearchFlow AI

> **Autonomous Market & Competitive Intelligence Platform for High-Growth Startups & Product Teams**

ResearchFlow AI transforms competitive research from a tedious, error-prone manual exercise into an automated, evidence-grounded intelligence workflow. It crawls real competitor websites, extracts structured claims (pricing, features, positioning), detects discrepancies, synthesizes strategic market opportunities, generates multi-channel campaign briefs (LinkedIn, Email, SEO), and outputs actionable execution tasks through a rigorous human review approval queue.

---

## Key Capabilities

1. **Strict Multi-Tenant SaaS Isolation & Security Boundary**:
   - Zero data leakage between accounts.
   - Server-side workspace authorization on every API endpoint.
   - Fresh user signups start with an **honestly empty workspace** (0 fake jobs, 0 dummy data).
   - Fully isolated Demo Mode sandbox (`ws_demo_sandbox`).

2. **Real Web Research Engine with Graceful Error Handling**:
   - Live HTTP/HTTPS fetching with 12s timeout and AbortController.
   - Accurate detection of HTTP `401 Unauthorized`, `403 Forbidden`, `504 Timeout`, DNS unreachable, and empty JS SPAs.
   - Real-time Google Search Grounding fallback with Gemini when public sites block direct scraping.
   - Accurate pipeline lifecycle from `QUEUED` to `AWAITING_REVIEW`.

3. **First-Class Evidence Provenance & Traceability**:
   - Evidence records categorized by `Pricing`, `Product Features`, `Target Audience`, `Positioning`, and `GTM Strategy`.
   - Distinct classification of `FACT` (direct quotes), `INFERENCE`, `RECOMMENDATION`, and `WARNING`.
   - Confidence scoring (`HIGH`, `MEDIUM`, `LOW`) with normalized data values.

4. **Automated Cross-Source Conflict Detection**:
   - Automatically detects price and feature discrepancies across multiple sources (e.g. $19/mo annual rate vs $29/mo monthly rate).
   - Human operator resolution workflows (`UNRESOLVED`, `HUMAN_VERIFIED`, `DISMISSED`) with audit logging.

5. **Multi-Model Dynamic AI Routing & Zero-Failure Fallback Engine**:
   - Multi-tier dynamic fallback chain:
     1. OpenRouter dynamically discovered free model catalog (`deepseek-r1:free`, `meta-llama/llama-3.3-70b-instruct:free`, `mistralai/mistral-7b-instruct:free`, etc.)
     2. Gemini models (`gemini-3.7-flash`, `gemini-3.6-flash`)
     3. Regex and schema self-repair parser
     4. Verified deterministic heuristic engine safety net
   - Prompt injection defense quarantining untrusted web data in `<untrusted_source_content>` wrappers.

6. **Human Review Queue & Actionable Task Board**:
   - Campaign briefs start in `DRAFT / AWAITING_REVIEW`.
   - Operators can inspect citations, edit positioning copy, and approve/reject.
   - Upon approval, actionable tasks are generated and persisted into the workspace Kanban/task board.

7. **12-Case Reliability Evaluation Benchmark**:
   - Automated testing across 12 rigorous edge cases (TC01–TC12) covering 404s, paywalls, conflicting prices, long pages, and partial failures.
   - Baseline comparison metrics demonstrating **95% time reduction** (4 hours manual vs 12 minutes AI).

---

## Quickstart

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
# Clone repository
git clone https://github.com/Dilip-chendra/ResearchFlow.AI.git
cd ResearchFlow.AI

# Install dependencies
npm install
```

### Environment Configuration (Optional)
Create a `.env` file in the root directory:
```env
# Optional: Gemini API Key for Google Search Grounding and Gemini models
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: OpenRouter API Key for free model discovery
OPENROUTER_API_KEY=your_openrouter_api_key_here
```
*Note: If no API keys are provided, the system operates seamlessly using its verified heuristic engine and simulated evaluation test suite.*

### Running the Application
```bash
# Start development server
npm run dev

# Run automated end-to-end test suite
npx tsx scripts/run-tests.ts

# Production build and typecheck
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Documentation Suite

Detailed architectural, security, and operational documentation is available in the `docs/` directory:

| Document | Description |
| :--- | :--- |
| [`docs/PRODUCT.md`](docs/PRODUCT.md) | Product vision, target personas, core workflows, and competitive edge |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System architecture, service topology, and data lifecycle |
| [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) | Complete data schema, entity relationships, and persistence layer |
| [`docs/AI_SYSTEM.md`](docs/AI_SYSTEM.md) | Dynamic multi-model routing, prompt budgeting, and injection defense |
| [`docs/RESEARCH_ENGINE.md`](docs/RESEARCH_ENGINE.md) | Web crawler, status classification, and grounding fallbacks |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Multi-tenant boundary, auth tokens, password hashing, and IDOR prevention |
| [`docs/EVALUATION.md`](docs/EVALUATION.md) | 12-case evaluation benchmark, rubric scoring, and baseline comparison |
| [`docs/FAILURES.md`](docs/FAILURES.md) | Failure classification and graceful degradation strategies |
| [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md) | Step-by-step user onboarding and workflow execution guide |
| [`docs/OPERATOR_RUNBOOK.md`](docs/OPERATOR_RUNBOOK.md) | Operations, deployment, monitoring, and backup runbook |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Future product roadmap and planned capabilities |
| [`docs/CASE_STUDY.md`](docs/CASE_STUDY.md) | End-to-end NextGen Resume AI reference case study |
| [`docs/AI_COLLABORATION.md`](docs/AI_COLLABORATION.md) | Human-in-the-loop AI interaction principles |

---

## License
MIT License. Built for startup founders, growth leads, and product teams.
