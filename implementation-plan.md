# Implementation Plan

## Phase 1 — Foundation & Environment Setup
_Goal: App starts, DB migrates, environment is configured._

| # | Task | Files |
|---|---|---|
| 1.1 | Start PostgreSQL via Docker Compose and verify connection | `docker-compose.yml` |
| 1.2 | Run Flyway migration and confirm schema created | `V1__init.sql` |
| 1.3 | Create `.env.example` with all required env variables | new file |
| 1.4 | Verify Spring Boot application starts without errors | `application.yml` |

---

## Phase 2 — Authentication & User Management
_Goal: Agents and admins can log in, JWT is issued, roles are enforced._

| # | Task | Files |
|---|---|---|
| 2.1 | Implement `POST /api/auth/login` — authenticate, return JWT | `AuthController` |
| 2.2 | Implement `POST /api/users` (admin only) — create user with BCrypt password | new `UserController`, `UserService` |
| 2.3 | Implement `GET /api/users` (admin only) — list all agents | `UserController`, `UserService` |
| 2.4 | Seed one admin user via Flyway `V2__seed_admin.sql` | new migration |
| 2.5 | Verify `@PreAuthorize` role checks on existing endpoints | `SecurityConfig` |

---

## Phase 3 — Gmail Integration
_Goal: App can read the target inbox, parse email content, and send replies._

| # | Task | Files |
|---|---|---|
| 3.1 | Set up Google Cloud service account, enable Gmail API, download `credentials.json` | external setup |
| 3.2 | Implement `GmailService.fetchUnreadMessages()` — list unread message IDs from target inbox | `GmailService` |
| 3.3 | Implement `GmailService.fetchMessageById()` — fetch full message with headers and body | `GmailService` |
| 3.4 | Implement email parser — extract `subject`, `body`, `from`, `threadId` from Gmail message payload | new `EmailParser` util |
| 3.5 | Implement `GmailService.sendReply()` — build MIME message, set `In-Reply-To` header, send on thread | `GmailService` |
| 3.6 | Implement `GmailService.markAsRead()` — remove `UNREAD` label | `GmailService` |
| 3.7 | Manual end-to-end test: send email to target inbox and verify it is fetched and parsed correctly | — |

---

## Phase 4 — Ticket Lifecycle
_Goal: Tickets are created, managed, assigned, and their statuses transition correctly._

| # | Task | Files |
|---|---|---|
| 4.1 | Verify `TicketService.createTicket()` saves correctly with SLA deadline | `TicketService` |
| 4.2 | Implement `GET /api/tickets` — all tickets for admin | `TicketController` |
| 4.3 | Implement `GET /api/tickets/my` — tickets assigned to logged-in agent (resolve agent from JWT) | `TicketController` |
| 4.4 | Implement `GET /api/tickets/{id}` — ticket detail with reply history | `TicketController`, `TicketReplyRepository` |
| 4.5 | Implement `PATCH /api/tickets/{id}/assign` — assign ticket to agent, set status to IN_PROGRESS | `TicketController`, `TicketService` |
| 4.6 | Implement `PATCH /api/tickets/{id}/status` — manual status update | `TicketController` |
| 4.7 | Implement `POST /api/tickets/{id}/reply` — agent sends reply, saves `TicketReply`, marks RESOLVED | `TicketController`, `GmailService` |
| 4.8 | Implement reopen logic — detect reply on RESOLVED/CLOSED thread, set status to REOPENED | `EmailPollingService`, `TicketService` |
| 4.9 | Implement SLA breach and at-risk flags on `TicketDTO` | `SLAService`, `TicketController` |

---

## Phase 5 — AI Classification & Knowledge Base
_Goal: Tickets are auto-classified, knowledge base entries are searchable by vector similarity._

| # | Task | Files |
|---|---|---|
| 5.1 | Implement `AIResponseService.classifyCategory()` — prompt Claude with a fixed category list, return category name | `AIResponseService` |
| 5.2 | Implement `AIResponseService.classifyPriority()` — prompt Claude to return HIGH / MEDIUM / LOW | `AIResponseService` |
| 5.3 | Implement `AIResponseService.draftReply()` — prompt Claude with email content + KB resolution, return human-friendly reply | `AIResponseService` |
| 5.4 | Implement `KnowledgeBaseService.addEntry()` — save to DB and add document to `VectorStore` | `KnowledgeBaseService` |
| 5.5 | Implement `KnowledgeBaseService.findBestResolution()` — similarity search via `VectorStore`, return resolution if score >= threshold | `KnowledgeBaseService` |
| 5.6 | Implement `POST /api/knowledge-base` — agent adds resolution (resolve `createdBy` from JWT) | `KnowledgeBaseController` |
| 5.7 | Manual test: add KB entry, submit similar email, verify AI finds and uses the resolution | — |

---

## Phase 6 — End-to-End Email Processing Pipeline
_Goal: Incoming emails are fully processed — auto-replied or escalated — without manual intervention._

| # | Task | Files |
|---|---|---|
| 6.1 | Complete `EmailPollingService.processMessage()` — wire classification, KB search, AI reply, escalation | `EmailPollingService` |
| 6.2 | Implement duplicate guard — skip message if `gmailMessageId` already exists in DB | `EmailPollingService`, `TicketRepository` |
| 6.3 | Confirm `GmailPollingScheduler` fires on schedule and logs correctly | `GmailPollingScheduler` |
| 6.4 | End-to-end test (known issue): send email → ticket created → AI replies → status RESOLVED | — |
| 6.5 | End-to-end test (unknown issue): send email → ticket created → stays OPEN in agent queue | — |
| 6.6 | End-to-end test (customer follow-up): reply to resolved ticket → status REOPENED | — |

---

## Phase 7 — Reporting API
_Goal: Admins can query metrics for ticket volume, resolution performance, and SLA compliance._

| # | Task | Files |
|---|---|---|
| 7.1 | Create `ReportService` + `ReportController` skeleton | new files |
| 7.2 | Implement ticket volume endpoint — count by status, category, date range | `ReportService` |
| 7.3 | Implement resolution rate endpoint — AI-resolved vs agent-resolved count | `ReportService` |
| 7.4 | Implement average resolution time endpoint — per category and per agent | `ReportService` |
| 7.5 | Implement SLA compliance rate endpoint — % resolved within deadline, per priority | `ReportService` |
| 7.6 | Implement KB hit rate endpoint — AI auto-replied count / total tickets | `ReportService` |

---

## Phase 8 — Frontend
_Goal: Web dashboard for agents and admins to view and manage tickets._

| # | Task | Files |
|---|---|---|
| 8.1 | Scaffold React + TypeScript + Vite + Tailwind + shadcn/ui project under `frontend/` | new project |
| 8.2 | Set up Axios API client with JWT Bearer token interceptor | `frontend/src/lib/api.ts` |
| 8.3 | Build login page — email/password form, store JWT in localStorage | `LoginPage` |
| 8.4 | Build protected route wrapper — redirect to login if no valid token | `PrivateRoute` |
| 8.5 | Build agent ticket queue — table with status badge, SLA indicator, priority chip | `AgentDashboard` |
| 8.6 | Build ticket detail page — email thread, reply composer, status/assign controls | `TicketDetail` |
| 8.7 | Build admin all-tickets view — same table + agent assignment dropdown | `AdminDashboard` |
| 8.8 | Build knowledge base page — list entries, add-entry form | `KnowledgeBasePage` |
| 8.9 | Build reports/analytics page — charts for volume, resolution rate, SLA compliance | `ReportsPage` |
| 8.10 | SLA visual indicators — green / amber / red badge based on breach/at-risk/on-track state | shared component |

---

## Phase 9 — Testing & Production Readiness
_Goal: App is stable, errors are handled gracefully, and it can be containerized._

| # | Task | Files |
|---|---|---|
| 9.1 | Global exception handler — map exceptions to consistent JSON error responses | new `GlobalExceptionHandler` |
| 9.2 | Unit tests for `SLAService` — deadline calculation, breach, at-risk logic | test |
| 9.3 | Unit tests for `TicketService` — status transitions, reopen logic | test |
| 9.4 | Unit tests for `AIResponseService` — verify prompt construction | test |
| 9.5 | Integration test for `EmailPollingService` — mock Gmail + AI, verify ticket creation flow | test |
| 9.6 | Create `Dockerfile` for the Spring Boot app | new file |
| 9.7 | Add app service to `docker-compose.yml` for full-stack local run | `docker-compose.yml` |
| 9.8 | Final smoke test — login → receive email → ticket created → reply sent → resolved | — |

---

## Summary

| Phase | Focus | Approx. Effort |
|---|---|---|
| 1 | Foundation | 1 day |
| 2 | Auth & Users | 2 days |
| 3 | Gmail Integration | 3 days |
| 4 | Ticket Lifecycle | 3 days |
| 5 | AI & Knowledge Base | 4 days |
| 6 | Email Pipeline | 2 days |
| 7 | Reporting API | 2 days |
| 8 | Frontend | 7 days |
| 9 | Testing & Prod Readiness | 3 days |
| **Total** | | **~27 days** |

> Phases 1–6 are the critical path. Phases 7–9 can overlap once Phase 6 is stable.
