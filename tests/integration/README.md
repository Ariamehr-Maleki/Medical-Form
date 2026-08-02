# Supabase-backed integration tests

The service-boundary integration suite runs without credentials and verifies authentication rejection, no-write-on-invalid-input, server-derived ownership, canonical CSV persistence, and duplicate handling. Cross-user policy verification requires two real Supabase test accounts and should be run against a disposable project after applying the migration; production RLS is never relaxed for tests.
