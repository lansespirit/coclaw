# OpenClaw Task Board (Workspace Template)

This file is designed to live inside your OpenClaw workspace (example: `~/.openclaw/workspace/TASKS.md`).

Goal: make long-running work **visible**, and make every automation run leave **evidence**.

## Safety rules (read)

- Do **not** paste API keys, OAuth tokens, or gateway tokens here.
- Do **not** paste full sensitive email bodies. Store only summaries + artifact paths.
- Prefer linking to workspace artifacts (reports, JSON, screenshots) instead of pasting raw data.

## How to use (minimal)

1. Put this file in your OpenClaw workspace.
2. For every cron job / automation:
   - write a timestamped artifact into the workspace (report file)
   - append one line to **Run Log** with: timestamp, task id, status, artifact path

Tip: if you can’t answer “what happened?” from this file + artifacts, the automation is not operable.

---

## Board

### Backlog

- [ ] **ID:** `T-000` **Title:** Replace with your task title  
       **Owner:** `you|agent` **Created:** `YYYY-MM-DD` **Updated:** `YYYY-MM-DD`  
       **Definition of done:** (one sentence, testable)  
       **Inputs:** (links, file paths)  
       **Notes:**  
       **Artifacts:** (add paths as they are produced)

### Doing

- [ ] **ID:** `T-001` **Title:** Example: Daily email digest  
       **Owner:** `cron` **Created:** `YYYY-MM-DD` **Updated:** `YYYY-MM-DD`  
       **Definition of done:** A report file exists for today and a summary was delivered.  
       **Inputs:** `inbox:automation@domain`, `filter:label=alerts`  
       **Notes:** Keep this read-only unless you have explicit approval gates.  
       **Artifacts:**
  - `reports/email-digest/2026-03-02.md`

### Blocked

- [ ] **ID:** `T-002` **Title:** Example: Browser automation keeps timing out  
       **Owner:** `you` **Created:** `YYYY-MM-DD` **Updated:** `YYYY-MM-DD`  
       **Blocked on:** Missing deps / rate limit / site protection / unclear repro  
       **Next step:** Reduce to minimal repro and capture logs.  
       **Artifacts:**
  - `reports/browser/timeout-repro.md`

### Done

- [x] **ID:** `T-003` **Title:** Example: Telegram bot enabled and responding  
       **Owner:** `you` **Created:** `YYYY-MM-DD` **Updated:** `YYYY-MM-DD`  
       **Definition of done:** `openclaw channels status --probe` reports healthy and bot responds in DM.  
       **Artifacts:**
  - `reports/telegram/verification.md`

---

## Run Log (append-only)

Append one line per run. Keep it short and link to artifacts.

Format:

`YYYY-MM-DD HH:MM` | `TASK_ID` | `OK|FAIL` | `what ran` | `artifact path` | `error summary (if any)`

Examples:

- `2026-03-02 09:00` | `T-001` | `OK` | `cron:email-digest` | `reports/email-digest/2026-03-02.md` | `-`
- `2026-03-02 09:05` | `T-002` | `FAIL` | `cron:browser-checkout` | `reports/browser/timeout-repro.md` | `browser control service timeout`
