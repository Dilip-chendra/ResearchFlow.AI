# ResearchFlow AI - Human-in-the-Loop AI Collaboration

## 1. Philosophy: AI Augmentation, Not Autonomous Abdication
ResearchFlow AI is intentionally designed around **Human-in-the-Loop (HITL)** architecture. Rather than treating AI as an infallible black box that autonomously publishes unreviewed content, the platform positions AI as a high-velocity intelligence assistant with strict human checkpoints.

---

## 2. The Human Verification Checkpoints

```mermaid
graph LR
    Crawl[1. Web Crawl & Clean] --> AI_Extract[2. AI Evidence Extraction]
    AI_Extract --> ConflictCheck[3. Automated Conflict Detection]
    ConflictCheck --> Human_Resolve{Operator Resolves Conflicts}
    Human_Resolve --> AI_Synth[4. AI Intelligence & Campaign Drafts]
    AI_Synth --> Human_Review{Operator Reviews & Approves Brief}
    Human_Review -->|Approved| Tasks[5. Task Board Generation]
    Human_Review -->|Rejected| Replan[Refine Inputs]
```

### Key Checkpoints:
1. **Conflict Resolution**: Flagged data discrepancies (e.g. conflicting pricing models) require human review to verify whether they represent billing variations, outdated information, or regional pricing.
2. **Campaign Brief Approval**: The generated campaign angle, primary message, and channel copy remain in `DRAFT` status until an authorized human team member approves or modifies the brief.
3. **Execution Task Accountability**: Generated tasks have clear justifications and assignable workflows so team members maintain full ownership of marketing execution.
