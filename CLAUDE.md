# Ticket Manager — Project Guide

AI-powered email ticketing system. Reads a target Gmail inbox, converts emails into tickets, auto-replies to known issues via LLM, and escalates unknown issues to human agents.

---

## Project Layout

```
ticket_manager/
├── CLAUDE.md                        ← this file
├── project-scope.md                 ← full product requirements
├── tech-stack.md                    ← stack decisions with rationale
├── implementation-plan.md           ← 9-phase plan with task breakdown
├── pom.xml                          ← Maven build (Spring Boot 3.3.5, Java 21 target)
├── docker-compose.yml               ← PostgreSQL + pgvector container (requires Docker daemon)
├── src/
│   └── main/
│       ├── java/com/ticketmanager/
│       │   ├── config/              ← SecurityConfig, GmailConfig (conditional)
│       │   ├── controller/          ← AuthController, TicketController, KnowledgeBaseController
│       │   ├── dto/                 ← LoginRequest/Response, TicketDTO, ReplyRequest
│       │   ├── enums/               ← TicketStatus, TicketPriority, UserRole
│       │   ├── model/               ← JPA entities: User, Ticket, TicketReply, KnowledgeBaseEntry
│       │   ├── repository/          ← Spring Data JPA repositories
│       │   ├── scheduler/           ← GmailPollingScheduler (conditional on gmail.enabled)
│       │   ├── security/            ← JwtUtil, JwtFilter, UserDetailsServiceImpl
│       │   └── service/             ← TicketService, SLAService, AIResponseService,
│       │                               KnowledgeBaseService, GmailService, EmailPollingService
│       └── resources/
│           ├── application.yml      ← base config (env-var placeholders)
│           ├── application-local.yml← local dev overrides (no env vars needed)
│           └── db/migration/
│               ├── V1__init.sql     ← full schema
│               └── V2__seed_users.sql ← dev seed users
└── frontend/                        ← React client
    ├── components.json              ← shadcn/ui config
    ├── vite.config.ts               ← proxies /api → localhost:8080
    ├── tailwind.config.js
    └── src/
        ├── api/                     ← client.ts (Axios+JWT), auth.ts, tickets.ts, knowledgeBase.ts
        ├── components/              ← PrivateRoute, StatusBadge, SLABadge + ui/ (shadcn)
        ├── hooks/                   ← useAuth.ts
        ├── pages/                   ← LoginPage, DashboardPage, TicketDetailPage, KnowledgeBasePage
        └── types/                   ← index.ts (TypeScript types matching backend DTOs)
```

---

## Running the Projects

### Prerequisites
- Java 25 installed (compiles to Java 21 target)
- PostgreSQL 14 running locally on port 5432
- Node 24 + npm 11

### Database (one-time setup)
```bash
psql -U $(whoami) postgres -c "CREATE USER ticketmanager WITH PASSWORD 'ticketmanager';"
psql -U $(whoami) postgres -c "CREATE DATABASE ticketmanager OWNER ticketmanager;"
psql -U $(whoami) postgres -c "GRANT ALL PRIVILEGES ON DATABASE ticketmanager TO ticketmanager;"
psql -U $(whoami) ticketmanager -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
```
Flyway runs automatically on startup and applies all migrations.

### Server
```bash
# From ticket_manager/
mvn spring-boot:run -Dspring-boot.run.profiles=local
# Starts on http://localhost:8080
```

### Frontend
```bash
# From ticket_manager/frontend/
npm run dev
# Starts on http://localhost:5174 (or 5173 if available)
# /api requests are proxied to localhost:8080 — no CORS config needed
```

### Dev Login Credentials
| Role  | Email                       | Password   |
|-------|-----------------------------|------------|
| Admin | admin@ticketmanager.com     | admin123   |
| Agent | agent@ticketmanager.com     | agent123   |

---

## Environment Variables

All required variables with defaults in `application-local.yml` for local dev.
For production, set these as real env vars:

| Variable               | Description                                  |
|------------------------|----------------------------------------------|
| `DB_USERNAME`          | PostgreSQL username (default: ticketmanager) |
| `DB_PASSWORD`          | PostgreSQL password (default: ticketmanager) |
| `JWT_SECRET`           | HS256 signing secret (min 32 chars)          |
| `ANTHROPIC_API_KEY`    | Claude API key (Phase 5+)                    |
| `GMAIL_CREDENTIALS_PATH` | Path to Google service account JSON       |
| `GMAIL_TARGET_INBOX`   | Target email address to poll                 |
| `gmail.enabled`        | Set to `true` to activate Gmail integration  |

---

## Key Architectural Decisions

### Gmail is feature-flagged
`GmailConfig`, `GmailService`, `EmailPollingService`, and `GmailPollingScheduler` are all annotated `@ConditionalOnProperty(name = "gmail.enabled", havingValue = "true")`. The app starts fully without Gmail credentials. Set `gmail.enabled: true` in config to activate.

### Spring AI is stubbed (Phase 5)
`AIResponseService` and `KnowledgeBaseService` have `TODO Phase 5` stubs — they compile and wire correctly but throw `UnsupportedOperationException`. The Spring AI Maven dependencies are commented out in `pom.xml` pending resolution of the correct artifact coordinates.

### JWT is stateless
Roles (`ADMIN`/`AGENT`) are embedded in the JWT claim. `@PreAuthorize("hasRole('ADMIN')")` is used on endpoints. No server-side sessions.

### Single database for everything
PostgreSQL with the `pgvector` extension will handle both relational data and vector similarity search for the knowledge base. Currently pgvector is not installed locally — install it via Docker (`pgvector/pgvector:pg16`) when implementing Phase 5.

### Lombok version
Must use Lombok **1.18.38** (configured in `pom.xml`). Earlier versions (including 1.18.36) crash with Java 25 due to `sun.misc.Unsafe.objectFieldOffset` changes. Harmless deprecation warnings on startup are expected.

---

## Database Schema

```
users           — id, email, name, password_hash, role (ADMIN/AGENT), created_at
tickets         — id, subject, body, email_from, gmail_message_id, gmail_thread_id,
                  category, priority, status, assigned_agent_id, sla_deadline,
                  created_at, updated_at, resolved_at
ticket_replies  — id, ticket_id, body, sent_by, ai_generated, sent_at
knowledge_base  — id, title, category, problem_description, resolution,
                  vector_store_doc_id, created_by, created_at
sla_config      — id, priority (HIGH/MEDIUM/LOW), resolution_hours (4/24/72)
```

Ticket statuses: `OPEN → IN_PROGRESS → RESOLVED → CLOSED`; can also transition to `REOPENED` when a customer replies to a resolved/closed thread.

---

## API Endpoints

| Method | Path                         | Role         | Notes                            |
|--------|------------------------------|--------------|----------------------------------|
| POST   | /api/auth/login              | Public       | Returns JWT                      |
| GET    | /api/tickets                 | ADMIN        | All tickets                      |
| GET    | /api/tickets/my              | ADMIN,AGENT  | Logged-in agent's tickets (TODO) |
| GET    | /api/tickets/{id}            | ADMIN,AGENT  | Ticket detail                    |
| PATCH  | /api/tickets/{id}/status     | ADMIN,AGENT  | Update status                    |
| PATCH  | /api/tickets/{id}/assign     | ADMIN        | Assign to agent                  |
| POST   | /api/tickets/{id}/reply      | ADMIN,AGENT  | Send reply, marks RESOLVED       |
| GET    | /api/knowledge-base          | ADMIN,AGENT  | List KB entries                  |
| GET    | /api/knowledge-base/{id}     | ADMIN,AGENT  | Single KB entry                  |
| POST   | /api/knowledge-base          | ADMIN,AGENT  | Add KB entry (TODO Phase 5)      |

---

## Build Commands

```bash
# Server
mvn compile                  # compile only
mvn spring-boot:run -Dspring-boot.run.profiles=local   # run
mvn test                     # run tests (requires DB)

# Frontend
npm run dev                  # dev server with HMR
npm run build                # production build → dist/
npx tsc --noEmit             # type-check only
npx shadcn@latest add <name> # add a shadcn component
```

---

## Implementation Status

| Phase | Description              | Status      |
|-------|--------------------------|-------------|
| 1     | Foundation               | Done        |
| 2     | Auth & User Management   | Partial — login done, user CRUD pending |
| 3     | Gmail Integration        | Stubbed     |
| 4     | Ticket Lifecycle         | Partial — CRUD done, `/my` endpoint pending |
| 5     | AI & Knowledge Base      | Stubbed     |
| 6     | Email Pipeline           | Stubbed     |
| 7     | Reporting API            | Not started |
| 8     | Frontend                 | Partial — pages scaffolded, wired to API |
| 9     | Testing & Production     | Not started |

See `implementation-plan.md` for full task breakdown.
