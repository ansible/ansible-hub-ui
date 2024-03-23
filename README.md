# Ansible Automation Hub UI

Frontend for Ansible Automation Hub. The backend for this project can be [found here](https://github.com/ansible/galaxy_ng/).

# Setting up Your Dev Environment

## Develop using Docker Compose (Recommended)

This project can now be run as a container alongside the API. Just follow the instructions on the [ansibe/galaxy_ng wiki](https://github.com/ansible/galaxy_ng/wiki/Development-Setup).

## Develop without containers

This app can be developed in standalone, community, or insights mode. Insights mode compiles the app to be run on the Red Hat cloud services platform (insights). Standalone mode only requires a running instance of the galaxy API for the UI to connect to. Community mode is similar to standalone, with github login and Roles.

For every mode, you first need to:

1. Clone the [galaxy_ng](https://github.com/ansible/galaxy_ng) repo and follow the setup instructions
2. Install node. Node v18+ is known to work. Older versions may work as well.
3. `npm install` in the UI

### Develop in Standalone Mode (default)

1. Start the API with `COMPOSE_PROFILE=standalone` (compose) or `COMPOSE_PROFILE=galaxy_ng/base` (oci-env)
2. `npm run start-standalone`

The app will run on http://localhost:8002/ui and proxy requests for `/api/automation-hub` to the api on `http://localhost:5001`.

### Develop in Community Mode

1. Start the API with `COMPOSE_PROFILE=standalone-community` (compose)
2. `npm run start-community`

The app will run on http://localhost:8002/ui and proxy requests for `/api` to the api on `http://localhost:5001`.

### Develop in Insights Mode

**NOTE:** This option is only relevant to Red Hat employees. Community contributors should follow setup for [standalone mode](#develop-in-standalone-mode)

1. Start the API with `COMPOSE_PROFILE=insights` (compose) or `COMPOSE_PROFILE=galaxy_ng/base:galaxy_ng/insights` (oci-env)
2. `npm run start-insights`

The app will run on http://localhost:8002/preview/ansible/automation-hub (and http://localhost:8002/beta/ansible/automation-hub) and proxy requests for `/api/automation-hub` to the api on `http://localhost:5001`.

### Workflows

List of all workflows:

- `backported-labels`: Add a backported-* label when a PR is backported to stable-*; on patchback merges
- `cypress`: Run Cypress integration tests; on PRs, pushes and cron
- `dev-release`: Build and upload to github releases, update `dev` tag; when master is updated
- `i18n`: Extract and merge l10n strings; cron
- `pr-checks`: Check for linter errors, obsolete package-lock.json and merge commits; on PRs only
- `stable-release`: Build and upload to github releases; when a stable release is created

List by branches:

- `master`: `backported-labels`, `cypress`, `dev-release`, `i18n`, `pr-checks`, `stable-release`
- `stable-*`: `backported-labels`, `cypress`, `i18n` (via cron from master), `pr-checks`, `stable-release`

### Version mapping

Our branches, backport labels, releases and tags use AAH versions, but Jira uses AAP versions.
To map between the two:

|AAP version|AAH version|
|-|-|
|2.3|4.6|
|2.4|4.9|

[Table with component versions](https://github.com/ansible/galaxy_ng/wiki/Galaxy-NG-Version-Matrix)

## Patternfly

- This project imports Patternfly components:
  - [Patternfly React](https://github.com/patternfly/patternfly-react)

## UI Testing

For more information about UI testing go to [test README](https://github.com/ansible/ansible-hub-ui/tree/master/test/README.md).
