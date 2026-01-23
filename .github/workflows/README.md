# Workflows Documentation

## Overview

This directory contains GitHub Actions workflows for:
- **CI/CD**: Automated testing, coverage, and packaging
- **QA**: Manual quality assurance for Hosted & Cloud modes
- **Monitoring**: Scheduled Umami reports (daily/weekly)
- **Maintenance**: Dependency updates and security audits

## Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `main_ci_and_package_action.yml` | Push/PR on `main`, `to-package` | Run tests, coverage, package action |
| `main_manual_qa_host.yml` | Manual | QA testing for Umami Hosted mode |
| `main_manual_qa_cloud.yml` | Manual | QA testing for Umami Cloud mode |
| `cron_daily_umami_report.yml` | Daily at 17:30 UTC | Generate daily report |
| `cron_weekly_umami_report.yml` | Weekly on Sunday at 23:59 UTC | Generate weekly report |
| `00_pnpm_audit.yml` | Manual/Scheduled | Security audit |
| `pnpm_*.yml` | Manual | Dependency version bumps |

## Required GitHub Secrets

Configure these secrets in: **Repository Settings → Secrets and variables → Actions**

### Production Umami Hosted (for cron & QA)

| Secret | Description | Example |
|--------|-------------|---------|
| `UMAMI_SERVER` | Umami v3.x server URL | `https://umami.example.com` |
| `UMAMI_USERNAME` | Umami username | `admin` |
| `UMAMI_PASSWORD` | Umami password | `***` |
| `UMAMI_SITE_DOMAIN` | Target website domain | `www.example.com` |

### Test Umami Hosted (for CI)

| Secret | Description | Example |
|--------|-------------|---------|
| `UMAMI_TEST_SERVER` | Test Umami server URL | `https://umami-test.example.com` |
| `UMAMI_TEST_USER` | Test username | `test-admin` |
| `UMAMI_TEST_PASSWORD` | Test password | `***` |
| `UMAMI_TEST_SITE_DOMAIN` | Test website domain | `test.example.com` |

### Test Umami Cloud (for CI & QA)

| Secret | Description | Example |
|--------|-------------|---------|
| `UMAMI_TEST_CLOUD_API_KEY` | Umami Cloud API key | Get from [cloud.umami.is/api-keys](https://cloud.umami.is/api-keys) |
| `UMAMI_TEST_CLOUD_SITE_DOMAIN` | Cloud test website domain | `cloud-test.example.com` |

### Optional - Discord Notifications

| Secret | Description |
|--------|-------------|
| `UMAMI_TO_DISCORD_WEBHOOK_URL` | Discord webhook URL for report notifications |

### Auto-provided by GitHub

| Secret | Description |
|--------|-------------|
| `GITHUB_TOKEN` | Automatically provided by GitHub Actions (no setup needed) |

## Environment Variables

Some workflows accept environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `UMAMI_CLIENT_TIMEOUT_MS` | `5000` | API request timeout in milliseconds |

## Workflow Triggers

### Automatic Triggers
- **CI/CD**: Pushes to `main`, `to-package`, PRs affecting `lib/`, `package.json`, `pnpm-lock.yaml`
- **Daily Report**: Every day at 17:30 UTC
- **Weekly Report**: Every Sunday at 23:59 UTC

### Manual Triggers
All workflows can be manually triggered via **Actions → [Workflow] → Run workflow**

## Packaging Process

When pushing to `to-package` branch:
1. Runs full test suite
2. Packages action with dependencies using `@vercel/ncc`
3. Deploys to orphan branch (from `package.json` → `orphanBranch` field)
4. Creates/updates `last-{orphanBranch}` tag

## Coverage Reports

- **Pull Requests**: Inline coverage comments via `lcov-reporter-action`
- **Main Branch**: Coverage report deployed to GitHub Pages (`gh-pages` branch)

## Troubleshooting

### Missing Secrets
If workflows fail with "secret not found":
1. Verify secret name matches exactly (case-sensitive)
2. Check secret is defined at repository level (not environment-specific)
3. Ensure secret has a value (empty secrets cause failures)

### Test Failures
- Check Umami server is accessible
- Verify credentials are valid
- Review test site has recent activity (some tests require pageviews > 0)

### Package Deployment Issues
- Ensure `orphanBranch` field exists in `package.json`
- Verify branch permissions allow force-push to orphan branches
- Check `GITHUB_TOKEN` has `contents: write` permission

## Related Documentation

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- [TESTING_ACTION.md](../TESTING_ACTION.md) - Testing instructions
- [agent.md](../agent.md) - Workflow methodology
