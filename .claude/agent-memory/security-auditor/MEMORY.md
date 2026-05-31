# Memory Index

- [Security Audit — Architecture Decisions](audit_architecture.md) — JWT auth flow, role resolution path, conditional Gmail beans, entity-vs-DTO patterns
- [Security Audit — Critical & High Findings](audit_findings_critical_high.md) — IDOR on GET /tickets/{id}, no CORS config, raw entity exposure, no rate limiting, ReplyRequest missing @Size
- [Security Audit — Medium & Low Findings](audit_findings_medium_low.md) — HTTP security headers, JWT claims, DB defaults, token localStorage, Gmail scope excess
- [Security Audit — Positive Controls](audit_positive_controls.md) — BCrypt hashes in seed, env-var pattern, @Valid on login/reply, STATELESS session, ConditionalOnProperty Gmail flag
- [Phase 5 Security Requirements](audit_phase5_requirements.md) — Prompt injection guard, KB POST @Valid, vector search input sanitization before AI goes live
