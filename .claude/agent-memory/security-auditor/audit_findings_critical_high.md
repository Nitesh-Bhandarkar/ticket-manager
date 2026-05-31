---
name: audit-findings-critical-high
description: Critical and High severity findings from first full security audit of ticket_manager
metadata:
  type: project
---

## Critical

### IDOR on GET /tickets/{id} (TicketController.java:52-55)
Any authenticated AGENT can fetch ANY ticket by guessing/iterating UUIDs. There is no ownership check — only `hasAnyRole('ADMIN', 'AGENT')`. Agents should only see tickets assigned to them (or unassigned).

### Ticket Entity Returned Directly — Full Data Exposure (TicketController.java:41-82)
`getAllTickets()`, `getMyTickets()`, `getTicket()`, `updateStatus()`, `assignTicket()` all return raw `Ticket` JPA entities. The `body` field contains full raw email content from customers (potentially PII). The existing `TicketDTO` class exists but is not used by the controller. Additionally `Ticket` carries internal fields like `gmailMessageId`, `gmailThreadId`, `slaDeadline` that the frontend should not necessarily receive as-is.

## High

### No CORS Configuration (SecurityConfig.java)
There is no `CorsConfigurationSource` bean and no `.cors()` configuration in `SecurityConfig`. Spring Boot's default CORS behavior blocks cross-origin requests but does NOT set `Access-Control-Allow-Origin` headers. In production, if the frontend is on a different origin (e.g. app.example.com vs api.example.com), this must be explicitly configured. More importantly — there is no protection against CSRF via SameSite or CORS if an attacker manages to get a user to make same-origin requests.

### No Rate Limiting on /api/auth/login (AuthController.java:25-43)
No brute-force protection: unlimited login attempts. An attacker can iterate passwords against known email addresses without throttling. Spring Security has no account lockout configured either.

### ReplyRequest Body Has No Maximum Size Constraint (ReplyRequest.java)
`@NotBlank` only validates non-empty. There is no `@Size(max = ...)` constraint. An authenticated agent could send a multi-megabyte reply body, which gets passed to `GmailService.sendReply()` and stored in DB (when reply persistence is added). This is a potential DoS vector.

### UnsupportedOperationException Leaks to API Response (KnowledgeBaseController.java:39, service stubs)
`KnowledgeBaseController.addEntry()` throws `UnsupportedOperationException("Not implemented yet")`. Without a global `@ControllerAdvice` exception handler, Spring Boot's default error handling returns this message in a 500 response. Same for `AIResponseService` stubs if called. Attacker enumeration concern is low, but this will also crash the `/api/knowledge-base` POST in a way that may reveal implementation details in non-prod environments.

### No Global Exception Handler
There is no `@RestControllerAdvice` class in the codebase. All unhandled `RuntimeException`s (e.g., "Ticket not found: {id}", "Agent not found: {id}" from `TicketService`) propagate to Spring Boot's default `/error` endpoint, which in dev mode can include stack traces in the response body.
