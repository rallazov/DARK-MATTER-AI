# Architecture

PrivacyVault AI ships as a modular monolith with explicit extraction seams for auth, core multimodal runtime, analytics, and admin domains.

## System Context

```mermaid
flowchart LR
    U[Users] --> FE[React Frontend]
    FE --> API[Node/Express Monolith]
    API --> DB[(MongoDB)]
    API --> WS[Socket.IO]
    API --> EXT[OAuth + Email + External Integrations]
    API --> EDGE[Edge Sync Webhooks]
```

## Module Boundaries

```mermaid
graph TD
    subgraph Backend
      AUTH[modules/auth]
      ONB[modules/onboarding]
      VAULT[modules/vaults]
      TASK[modules/tasks]
      BOTS[modules/bots]
      INTEG[modules/integrations]
      PRIV[modules/privacy]
      ADMIN[modules/admin]
      AUDIT[modules/audit]
    end

    AUTH --> VAULT
    VAULT --> TASK
    TASK --> BOTS
    INTEG --> TASK
    PRIV --> AUDIT
    ADMIN --> AUDIT
```

## Request Flows

```mermaid
sequenceDiagram
    participant User
    participant FE as Frontend
    participant API as Backend
    participant DB as MongoDB
    participant WS as Socket

    User->>FE: Submit multimodal task
    FE->>API: POST /api/tasks (vaultId, prompt, file)
    API->>DB: Insert Task(status=processing)
    API->>API: OCR/STT + AI stub generation
    API->>DB: Update Task(status=completed)
    API->>WS: Emit task stream chunks
    WS-->>FE: task:stream:chunk/end
    FE-->>User: Render private result
```

## Scale Notes

- Vault isolation uses `vaultId` scoping on all domain entities.
- `Vault.shardKey` exists for future Mongo sharding.
- Socket rooms are scoped by vault.
- Event bus and cache abstractions are in place for Redis/Kafka extraction.
