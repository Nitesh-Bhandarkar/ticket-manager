---
name: audit-architecture
description: Security-relevant architectural decisions in ticket_manager — JWT flow, role resolution, entity serialization, Gmail flag
metadata:
  type: project
---

## JWT Authentication Flow

- `JwtUtil.generateToken()` embeds email as `subject` and role as a custom `role` claim.
- `JwtFilter` validates the token signature, then calls `userDetailsService.loadUserByUsername(email)` — roles are sourced from the DATABASE, NOT from the JWT claim. This is the secure pattern; JWT role tampering does not affect server-side authorization.
- `@PreAuthorize` annotations use Spring Security's `UserDetails` authorities which come from the DB query.
- Token expiry: 86400000ms (24 hours). No refresh token mechanism exists.
- No `iss` or `aud` claims are set on tokens.

## Role Resolution

- `UserDetailsServiceImpl` maps `user.getRole().name()` → `"ROLE_" + role` for Spring Security.
- The JWT `role` claim is present but NOT read back by `JwtFilter` for authorization — it is only used by the frontend (`AuthContext.tsx` parses it to display the role label).

## Entity vs DTO Pattern

- `TicketController` returns `Ticket` JPA entity directly (not `TicketDTO`) on ALL endpoints.
- `Ticket` entity has `@ManyToOne(fetch = FetchType.LAZY) User assignedAgent` — with `open-in-view: false`, Jackson will attempt to serialize the Hibernate proxy; without `Hibernate5Module` registered this causes either a serialization error or silently omits the field. Either way, no `passwordHash` is leaked via this path currently.
- `UserController` correctly uses `UserDTO.from(user)` — `passwordHash` never serialized.
- `KnowledgeBaseController` returns `KnowledgeBaseEntry` entity directly with LAZY `User createdBy` — same proxy issue.

## Gmail Feature Flag

- `GmailConfig`, `GmailService`, `EmailPollingService`, `GmailPollingScheduler` all use `@ConditionalOnProperty(name = "gmail.enabled", havingValue = "true")`.
- When `gmail.enabled` is absent/false, none of these beans are instantiated. No partial initialization risk.
- `GmailConfig` is a `@Configuration` class WITHOUT `@ConditionalOnProperty` at the class level — only the `@Bean` method has it. The `credentialsPath` `@Value` field is still injected even when Gmail is disabled, but this only fails at startup if the field is blank, not a security issue.

## Key Config Files

- `application.yml`: env-var placeholders for DB, JWT, Anthropic, Gmail. No defaults for `JWT_SECRET` or `ANTHROPIC_API_KEY` (good).
- `application-local.yml`: hardcoded dev credentials. Listed in `.gitignore` correctly.
- `V2__seed_users.sql`: BCrypt hashes used (bcrypt2b $10 cost factor). Passwords not in plaintext.
