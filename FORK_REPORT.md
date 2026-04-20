# Fork Sanitization Report

- **.env.local**: File removed to prevent leaking secrets. Keys migrated to \.env.example\ with placeholder values.
  - \SNYK_TOKEN\
  - \STRYKER_DASHBOARD_API_KEY\
  - \CHROMATIC_PROJECT_TOKEN\
  - \CHANGELOG_GITHUB_TOKEN\
- **tests/integration.test.ts**: Replaced hardcoded \TEST_JWT_SECRET\ with a placeholder.
- **tests/chaos/docker-compose.yml**: Replaced hardcoded \JWT_SECRET\ with a placeholder.
- No internal endpoints, \.corp\, \.internal\, Jira, or Slack references were found in the codebase.
