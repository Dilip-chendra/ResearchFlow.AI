# ResearchFlow AI - Failure Recovery & Graceful Degradation

## 1. Resilience Architecture
ResearchFlow AI is engineered under the assumption that external web scrapers, remote AI APIs, and user inputs will periodically fail. The platform utilizes comprehensive graceful degradation strategies so that failure in any single component never crashes the system.

---

## 2. Failure Matrices & Recovery Protocols

```mermaid
graph TD
    subgraph WebCrawlFailures [Web Scrape Failures]
        W1[404 / Unreachable DNS] --> R1[Record UNREACHABLE; Continue remaining sources]
        W2[401 / 403 Anti-bot] --> R2[Trigger Google Search Grounding; if blocked, record AUTH_REQUIRED]
        W3[Timeout > 12s] --> R3[Abort controller cancels socket; record TIMEOUT]
        W4[Empty JS SPA] --> R4[Record EMPTY_CONTENT; Prompt user for public SSR page]
    end

    subgraph AIFailures [AI Provider Failures]
        A1[Rate Limit HTTP 429] --> RA1[Switch immediately to next candidate model]
        A2[Timeout > 22s] --> RA2[Abort model request; trip to secondary provider]
        A3[Malformed JSON output] --> RA3[Execute regex self-repair parser]
        A4[Unrepairable schema] --> RA4[Activate deterministic heuristic engine]
    end
```

---

## 3. Graceful Status Reporting

When failures occur, ResearchFlow AI presents transparent, honest status states rather than faking success or masking errors:

- **`partial`**: Displayed when at least one competitor source succeeded and one or more failed. The campaign strategy is generated from verified evidence while failed sources are clearly flagged in the pipeline overview.
- **`failed`**: Displayed when all sources are inaccessible or input validation fails. The operator receives an exact diagnostic message (e.g., *"Source returned HTTP 403: Access restricted by anti-bot firewall. Please provide an alternate public URL"*).
- **`UNRESOLVED` Conflict**: Highlighted with an amber badge when opposing claims exist across sources. The operator can verify or dismiss the conflict before campaign sign-off.
