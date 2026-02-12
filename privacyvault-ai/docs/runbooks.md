# Runbooks

## Incident: Elevated 5xx

1. Check `/api/health` and pod readiness.
2. Inspect logs for failing module path.
3. Reduce traffic with stricter rate limits temporarily.
4. Roll back to previous image if regression confirmed.

## Backup / Restore

1. Run daily Mongo snapshots.
2. Encrypt backup artifacts at rest.
3. Test restore weekly in staging.

## Key Rotation

1. Rotate JWT and encryption secrets via Kubernetes Secret update.
2. Restart pods with rolling strategy.
3. Re-issue integration credentials where mandatory.
