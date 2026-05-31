---
name: audit-findings-medium-low
description: Medium and Low severity findings from first full security audit of ticket_manager
metadata:
  type: project
---

## Medium

### Missing HTTP Security Headers (SecurityConfig.java)
No `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, or `Content-Security-Policy` headers configured. Spring Security 6 does set some defaults (X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Cache-Control) via `HeadersConfigurer`, but since the filter chain is built with `.build()` and headers are not explicitly configured, need to verify defaults are active. CSP is not a Spring Security default.

### JWT Missing iss/aud Claims (JwtUtil.java:25-33)
`generateToken()` sets `subject`, `role` claim, `issuedAt`, and `expiration` but omits `issuer` (`iss`) and `audience` (`aud`) claims. Without these, a JWT from this service could theoretically be replayed against another service that shares the same signing key, and token validation doesn't verify intended audience.

### DB Credential Defaults in application.yml (application.yml:7-8)
`${DB_USERNAME:ticketmanager}` and `${DB_PASSWORD:ticketmanager}` have default fallback values. If `DB_USERNAME`/`DB_PASSWORD` env vars are not set in production, the app silently connects with the dev credentials. The `JWT_SECRET` correctly has NO default — same pattern should apply to DB credentials.

### Hardcoded Dev Secret in application-local.yml (application-local.yml:11)
`jwt.secret: local-dev-secret-key-min-32-chars-long!!` is a predictable, human-readable string. File is correctly in `.gitignore` so it cannot be committed, but if a developer accidentally commits it or copies it to application.yml, it becomes a known weak secret.

### JWT Stored in localStorage (frontend/src/context/AuthContext.tsx:32)
`localStorage.setItem("token", token)` makes the JWT accessible to any JavaScript running on the page (XSS risk). The correct pattern for high-security apps is `httpOnly` cookies. For this app, localStorage is an acceptable trade-off given React renders no user-supplied HTML, but it should be documented.

### DB Connection Uses Plain JDBC URL Without SSL (application.yml:6)
`jdbc:postgresql://localhost:5432/ticketmanager` — no `?ssl=true&sslmode=verify-full` parameters. In production, DB traffic should be encrypted in transit.

### docker-compose.yml Uses Default Credentials
`POSTGRES_USER: ticketmanager`, `POSTGRES_PASSWORD: ticketmanager` matches defaults in `application-local.yml`. These are fine for local dev but must be changed before any internet-accessible deployment. Docker port `5432:5432` binds to all interfaces by default.

### Gmail Scopes Broader Than Necessary (GmailConfig.java:39-41)
Three scopes requested: `GMAIL_READONLY`, `GMAIL_SEND`, `GMAIL_MODIFY`. `GMAIL_READONLY` is redundant when `GMAIL_MODIFY` already includes read access. Principle of least privilege: only `GMAIL_SEND` and `GMAIL_MODIFY` are needed.

## Low

### Ticket Status Transition Not Validated (TicketController.java:57-62)
`PATCH /tickets/{id}/status` accepts any `TicketStatus` value without validating the state machine transition (e.g., an agent can directly transition from OPEN to CLOSED, skipping IN_PROGRESS or RESOLVED). This is a business logic concern with security implications (agents could bypass SLA tracking).

### KnowledgeBaseEntry Returned as Raw Entity (KnowledgeBaseController.java)
The `createdBy` field is a `User` with LAZY loading. With `open-in-view: false`, this will cause a `LazyInitializationException` during serialization unless the session is still active. This is a runtime correctness bug that also means no DTO projection is applied — if `createdBy` were EAGER, `passwordHash` would serialize.

### No Pagination on List Endpoints
`GET /api/tickets` (admin) and `GET /api/knowledge-base` call `findAll()` — no pagination. With thousands of tickets this is a DoS/memory exhaustion vector. Spring Data `Pageable` should be used.

### Frontend /users Route — Server-Side Check Exists, Client-Side Incomplete
`App.tsx:108` wraps `/users` in `<PrivateRoute roles={["ADMIN"]}>`. `UserController` has `@PreAuthorize("hasRole('ADMIN')")`. The server-side check is correct. However, an AGENT who navigates directly to `/users` via URL bar gets a redirect to `/` by `PrivateRoute` — this is correct. No gap here, just confirming.

### google-oauth-client-jetty 1.34.1 Contains Embedded Jetty
`google-oauth-client-jetty` includes an embedded Jetty server used for OAuth user-consent flows. This flow is not used (service account auth is used instead), but the dependency adds unnecessary attack surface. Consider excluding or replacing with `google-oauth-client` (no Jetty).
