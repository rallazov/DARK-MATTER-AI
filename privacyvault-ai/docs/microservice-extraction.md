# Microservice Extraction Roadmap

## Current Monolith Seams

- `modules/auth` -> `auth-service`
- `modules/tasks`, `modules/bots`, `modules/integrations` -> `core-service`
- `modules/admin`, `modules/analytics` -> `ops-service`
- shared contracts in `/shared`

## Extraction Steps

1. Move auth routes + token utilities behind dedicated service boundary.
2. Introduce API gateway with mTLS between services.
3. Externalize queue/cache adapters (Redis + Kafka/NATS).
4. Split Mongo collections by service ownership, keep `vaultId` as cross-service tenant key.
5. Convert synchronous module calls to event-driven integration where needed.

## Data Strategy

- Keep append-only audit as shared compliance stream.
- Use CDC/event outbox for eventual consistency between auth/core/admin services.
