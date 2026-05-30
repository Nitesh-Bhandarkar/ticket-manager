## Tech Stack

### Backend
| Layer | Choice | Notes |
|---|---|---|
| Language | Java 21 | LTS version |
| Framework | Spring Boot 3.3.x | Core application framework |
| REST API | Spring Web | REST controllers |
| ORM | Spring Data JPA + Hibernate | Database access layer |
| Security | Spring Security + JWT (jjwt 0.12.x) | Stateless auth, role-based access |
| AI / LLM | Spring AI 1.0.0 + Anthropic Claude API | claude-sonnet-4-6 for classification and reply drafting |
| Vector Search | Spring AI PgVectorStore | Knowledge base similarity search via pgvector |
| Email | Gmail API Java Client + Google Auth Library | Read target inbox, send replies via OAuth2 |
| Background Jobs | Spring Scheduler | Gmail inbox polling — no external queue needed |
| DB Migrations | Flyway | Schema versioning |
| Build | Maven | Dependency management |

### Database
| Choice | Purpose |
|---|---|
| PostgreSQL 16 | Primary relational store (tickets, users, SLA, KB) |
| pgvector extension | Vector similarity search for knowledge base embeddings |

### Frontend
| Choice | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Pre-built component library (tables, badges, dialogs) |
| Vite | Build tool and dev server |

### Infrastructure
| Choice | Purpose |
|---|---|
| Docker + Docker Compose | Local development environment |
| PostgreSQL (Docker) | Database container with pgvector |

### Key Design Decisions
- **Spring Scheduler** instead of Celery + Redis — background Gmail polling runs inside the Spring application context, simpler infra.
- **pgvector** instead of a separate vector DB (Pinecone, Weaviate) — one database for relational data and vector similarity search.
- **Stateless JWT** — no server-side sessions; role claims (ADMIN / AGENT) embedded in token.
- **Spring AI** abstraction over direct Anthropic SDK — makes it easy to swap models or providers later.
