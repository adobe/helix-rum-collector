# CI and release authorization

## Selected authorization model

- npm publication uses OIDC through a trusted publisher requiring the GitHub `release` environment. Mainline and 1.x need no npm token.
- GitHub publication uses the job's short-lived `github.token` / `GITHUB_TOKEN`, not `adobe-bot`, a PAT, a custom App key or `RELEASE_GITHUB_TOKEN`.
- Build/test jobs default to read-only repository access. Only publishing jobs request the write permissions needed for tags, GitHub releases and release-branch updates. Metadata helpers retain their explicit, narrower permissions.
- Stored provider/notification credentials belong in the corresponding protected environment, never a shared publishing credential exposed to branch CI.

## Explicit publication pause

The repository variable `RELEASE_ENABLED` must compare equal to `true` for normal publication. It remains false during this migration. Unset/false skips publication while ordinary tests continue. Collector CI deployment and maintenance have independent `CI_DEPLOY_ENABLED` and `MAINTENANCE_ENABLED` switches.

These switches are operational controls, not authorization boundaries. Exact ref guards and environment branch policies remain required. Keep all switches false until the appropriate reviewed path has been validated.

## Source branches and generated metadata

Releases do not commit version/changelog changes back to `main` or `1.x`. The `@semantic-release/git` plugin is removed. npm's prepare step can update package metadata in the ephemeral release workspace, but no source-branch push is made.

Release-local notes are generated in `release-notes.md`, attached to the GitHub release, and included in the artifact branches where those are published. The generated file is cleared before each CI release. GitHub Releases/npm version metadata are authoritative; the source branch's historical `CHANGELOG.md` and package version are no longer automatically maintained by a publishing account.

No publisher gets a PR-review or force-push bypass on source branches. The old `adobe-bot` review allowances are removed. Repository review requirements remain enabled for administrators as well.

## Preserved AEM delivery path and accepted trade-off

The tagger-backed 2.x publication path remains:

`release-* branches → AEM Code Sync → aem.live`

The GitHub Actions App identity is allowed to create/update/force-update only the existing `release-*` branch pattern. Deletion remains blocked. Source-branch bypasses are not granted to this identity.

**Accepted policy trade-off:** this is the generic GitHub Actions identity, not a job- or environment-specific branch writer. Another same-repository workflow that can request a write token can use the release-branch allowance too. The maintainer explicitly selected this model rather than a dedicated publisher App. Do not describe protected environments as isolating GitHub release-branch writes to one workflow; they still protect npm OIDC claims and stored environment secrets.

GitHub Actions does not recursively run ordinary workflows for pushes made with GITHUB_TOKEN. AEM Code Sync is an external integration; delivery must be checked with the canary workflow before relying on this path. No live delivery claim is based solely on local Git tests.

## Validation

`npm run test-release` loads the release configuration and resolves every plugin without publishing credentials. It also verifies there is no source-commit plugin or obsolete credentialed dry-run script. The tagger-backed packages additionally run local bare-Git tests for ref names, dirty/detached worktrees, missing/unsafe artifacts, atomic failure and stale leases.

Run the normal lint/browser/Node suites and `actionlint .github/workflows/*` as well. No validation command should reintroduce a publishing token into branch tests.

## Collector environments

The `production`, `ci` and `maintenance` environments allow only reviewed main. Normal publication also requires RELEASE_ENABLED; manual CI deployment and cleanup use their own default-off switches.

The collector uses its built-in GitHub token for GitHub release/tag bookkeeping; no GitHub bot secret is needed. Its provider operations still need narrowly scoped credentials:

- production: `HLX_FASTLY_AUTH`, `HLX_CLOUDFLARE_AUTH`, account/email configuration and the licensed `IAB_SPIDER_LIST`; optional Slack webhook.
- ci: a CI-only Fastly token/service ID and a distinct `HLX_CLOUDFLARE_CI_AUTH`, with CI account/configuration. Never fall back to the production token or default production service.
- maintenance: a cleanup-only Fastly token scoped to the non-production services it may manage.

GitHub secret copies/grants for the old shared publishing/deployment credentials were removed in the hard cutover. That does not revoke their issuer permissions elsewhere. Do not restore broad repository/organization copies to make a job pass.

The collector's build-only check verifies the actual edge ZIP. Deployment remains separate and default-off. Provider deployment has not been validated by the credential-free release-config check.
