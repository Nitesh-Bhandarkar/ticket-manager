---
name: audit-positive-controls
description: Security controls that are correctly implemented in ticket_manager as of initial audit
metadata:
  type: project
---

- BCrypt ($2b$10) used for password hashing in V2__seed_users.sql — not plaintext
- JWT secret has no default fallback in application.yml (fails fast if not set)
- JJWT 0.12.5 used — modern, no known critical CVEs as of audit date
- Session management set to STATELESS in SecurityConfig
- @Valid on LoginRequest and ReplyRequest (though ReplyRequest missing @Size)
- application-local.yml correctly in .gitignore
- UserDTO.from() correctly excludes passwordHash from user listings
- UserController returns UserDTO, not User entity — no password hash exposure there
- Gmail feature flag correctly isolates all Gmail beans via @ConditionalOnProperty
- JwtFilter re-queries UserDetailsService from DB — role cannot be elevated via JWT claim tampering
- CSRF disabled intentionally (correct for stateless JWT APIs; documented)
- @PreAuthorize on every controller endpoint — no unprotected endpoints beyond /api/auth/**
- open-in-view: false — prevents N+1 query anti-pattern and accidental lazy load in HTTP thread
- No dangerouslySetInnerHTML usage anywhere in React frontend
- Ticket body rendered as text (whitespace-pre-wrap CSS, not innerHTML) — no XSS from email content
- LoginPage shows generic error "Invalid email or password" — no user enumeration via error message
- UUIDs used as entity IDs — not sequential integers (harder to enumerate, though UUIDs alone are not an IDOR fix)
- TicketReply.sentBy is nullable (sent_by UUID REFERENCES users(id)) — correct for AI-generated replies
