# Decommissioned

Decommissioned on 2026-10-16 (the stack had been switched off on 2026-09-16).
This repository is archived and no longer deployed.

Blossom by Olha (blossombyolha.com, and its admin panel on
app.blossombyolha.com) is now served by **Tiendifai**, the multi-tenant store
platform (Forgejo `jose/tiendifai`, tenant slug `blossom`).

What was removed on the EPYC that day:

- Dokploy compose `blossom` (`compose-synthesize-cross-platform-panel-c4m29k`)
  and its deploy dir.
- PostgreSQL databases `blossom_jewellery_art` and `blossom` and their roles
  `blossom_jewellery_art_user`, `blossom_jewellery_art_user_r2` and `blossom`.
- The self-hosted GitHub Actions runner `epyc-blossom-jewellery-art` (disabled
  and deregistered), the Forgejo deploy webhook and the deploy-registry entry.

Backups (root-only on the EPYC): `/backup/decommissioned/2026-10-16/`
(`blossom_jewellery_art.dump`, `blossom.dump` in pg_dump custom format and the
deploy dir tarball).

The git history stays here for reference. Do not redeploy it: it would compete
with Tiendifai for the same domains.
