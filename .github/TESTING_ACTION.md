# Testing the Action

This document describes how to test the action both locally and through GitHub.

## Local Testing

To test the action locally, you'll need:

- [Act](https://github.com/nektos/act) - A tool for running GitHub Actions locally
- Docker installed on your machine

### Installation

- Install Act following the instructions at https://github.com/nektos/act#installation

- Setup workflow secrets : the tested workflow will rely on ([act vars](https://nektosact.com/usage/index.html#vars))

```bash
cp env/.env.template env/.env.dontpush.act
# edit env/.env.dontpush.act
```

### Running Tests

- From the root of the repository, run:
```bash
# show workflow events
act -l
# or `gh act -l` if act is installed as gh client extension
# run an event for a given workflow
act -W '.github/workflows/00_pnpm_audit.yml' schedule
gh act --secret-file env/.env.dontpush.act -W '.github/workflows/cron_daily_umami_report.yml' schedule
```

This will execute the integration test workflow locally using Act.

## Notes

- The local tests using Act might behave slightly differently from GitHub Actions due to environment differences
- Make sure you have enough disk space for Docker images when testing locally
- The integration tests require Docker to be running locally