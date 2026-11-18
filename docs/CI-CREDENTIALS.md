# CI credential isolation

## Security boundary

Branch tests and PR helpers must not receive publishing, release-bot or cloud-deployment credentials. Removing a secret reference from YAML is not sufficient: a repository/organization secret can be referenced again by another branch. Privileged values must be stored only in branch-restricted GitHub environments, and their old repository/organization availability must be removed.

Do not merge this migration until the environment prerequisites and cutover checks below are complete. An environment declaration in YAML does not configure its protection. Do not let GitHub auto-create an unprotected environment.

## What remains in ordinary CI

The default workflow token is read-only for build/test jobs. PR-description and semantic-release-comment helpers use the short-lived GitHub token with only the permissions their metadata operations need; they do not receive the shared Adobe bot token.

CODECOV_TOKEN remains limited to coverage upload steps. Existing AI-review credentials/workflows are a separate scope and are not changed by this migration. This change removes **publishing/deployment authority**, not every credential used for observability or AI services.

## Cutover order

1. Create and restrict the environments described below. Use exact branch policies of type `branch`; do not permit arbitrary branches or tags. Set `can_admins_bypass: false` and consider an additional independent reviewer for production/maintenance.
2. Provision new environment-only credentials with the narrowest repository/service/account scope. GitHub cannot reveal existing secret values for copying. Use the GitHub secret UI or a secure secret-input tool; never paste tokens into issues, PRs or chat.
3. Verify the **environment secret metadata** contains all required names. Do not rely on a repository/organization fallback value.
4. Review and merge the mainline and maintained 1.x workflow changes. Coordinate the short transition with the release operator; do not enable an old branch's publishing workflow after removing its credentials.
5. Remove these repositories' access to shared organization `ADOBE_BOT_GITHUB_TOKEN` and `ADOBE_BOT_NPM_TOKEN` secrets, and delete any repository copies. Do not delete shared organization secrets globally. For all-repository organization secrets, an organization administrator must convert availability safely without disrupting other repositories.
6. Remove/revoke the old repository publishing/deployment token copies listed below. Deleting a GitHub secret does not revoke the credential at its issuer. Replace an old shared token if it remains capable of writing these repositories through another consumer.
7. Verify a harmless feature-branch run has no privileged secret access; attempts to enter protected environments are denied. Do not log values, token prefixes or derived hashes. Check presence only through boolean results and administrative metadata.
8. Run a controlled release/deployment from an allowed reviewed branch and verify normal bot bookkeeping and monitoring. Do not loosen protections or restore broad secrets to fix an incomplete migration.

The release token currently needs to act as `adobe-bot`, because branch protection permits that publisher's bookkeeping and release-branch writes. Prefer a narrowly scoped credential. If moving to a GitHub App, update the allowed publisher identity deliberately rather than adding broad bypass rights.

## Validation

Run `actionlint .github/workflows/*` and `git diff --check`. Review every `secrets.*` reference, the containing job's environment and its ref condition. Test jobs must not gain contents-write or publishing OIDC authority merely to run a release dry run.

## Collector environments

All three environments allow only the reviewed `main` branch. Workflow-dispatch jobs also have an explicit `github.ref == 'refs/heads/main'` guard.

| Environment | Required credentials/configuration |
| --- | --- |
| `production` | `RELEASE_GITHUB_TOKEN`, `HLX_FASTLY_AUTH`, `HLX_CLOUDFLARE_AUTH`, `HLX_CLOUDFLARE_EMAIL`, `HLX_CLOUDFLARE_ACCOUNT`, `IAB_SPIDER_LIST`; optional `SLACK_WEBHOOK` |
| `ci` | CI-only `HLX_FASTLY_CI_AUTH`, `HLX_FASTLY_CI_ID`, **new CI-only** `HLX_CLOUDFLARE_CI_AUTH`; CI account/email and licensed spider list under the same non-token names used above |
| `maintenance` | `FASTLY_CLEANUP_AUTH`, limited to the non-production services cleanup may manage |

Do not reuse the production Cloudflare token for CI. If the provider cannot scope a token tightly enough inside the account, use a separate CI account or a narrowly scoped deployment broker. Identifiers/emails are configuration, not bearer credentials, but keeping configuration with its environment avoids accidental cross-target deployment.

### Workflow behavior changes

- `build.yml` now tests and builds without deployment credentials or the licensed spider-list secret. The IAB-specific integration assertion already skips without the list; production predeploy still generates the real list.
- The production workflow now waits for that reusable test/build workflow before entering `production`. Publishing still creates a fresh build from the same reviewed revision; this is a test gate, not artifact attestation.
- Automatic feature-branch deployment and its post-deploy test are removed. `deploy-ci.yml` preserves deployment/integration testing as a manual, protected operation on reviewed main using distinct CI credentials.
- Fastly cleanup no longer runs on PR-close events. It is a manual main-only operation in `maintenance` with a cleanup-only token. GitHub lookup failures other than a confirmed HTTP 404 abort rather than authorize deletion.
- Cleanup still uses the existing versioned Fastly CLI download. Verifying/pinning its distribution digest is a separate supply-chain hardening task.

After provisioning and merging, remove repository/organization availability of `HLX_FASTLY_AUTH`, `HLX_FASTLY_CI_AUTH`, `HLX_CLOUDFLARE_AUTH`, legacy `FASTLY_AUTH`, and any new environment-only token name accidentally stored at repository/organization scope. Revoke old broadly scoped provider tokens after replacements are verified. Keep the licensed list environment-only as well; moving it is a data-handling requirement rather than token revocation.
