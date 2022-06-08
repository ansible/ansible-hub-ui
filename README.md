# Ansible Automation Hub UI

Frontend for Ansible Automation Hub. The backend for this project can be [found here](https://github.com/ansible/galaxy_ng/).

# Setting up Your Dev Environment

## Develop using Docker Compose (Recommended)

This project can now be run as a container alongside the API. Just follow the instructions on the [ansibe/galaxy_ng wiki](https://github.com/ansible/galaxy_ng/wiki/Development-Setup).

## Develop without containers

This app can be developed in standalone mode or insights mode. Insights mode compiles the app to be run on the Red Hat cloud services platform (insights). Standalone mode only requires a running instance of the galaxy API for the UI to connect to.

### Develop in Standalone Mode

1. Clone the [galaxy_ng](https://github.com/ansible/galaxy_ng) repo and follow the instructions for starting up the API.
2. Install node. Node v14+ is known to work. Older versions may work as well.
3. `npm install`
4. `npm run start-standalone`

The app will run on http://localhost:8002/ui and proxy requests for `/api/automation-hub` to the api on `http://localhost:5001`.

### Develop in Insights Mode

**NOTE:** This option is only relevant to Red Hat employees. Community contributors should follow setup for [standalone mode](#develop-in-standalone-mode)

1. Clone the [galaxy_ng](https://github.com/ansible/galaxy_ng) repo and start the API with `COMPOSE_PROFILE=insights`.
2. Install node. Node v14+ is known to work. Older versions may work as well.
3. `npm install`
4. `npm run start`

The app will run on http://localhost:8002/beta/ansible/automation-hub and proxy requests for `/api/automation-hub` to the api on `http://localhost:5001`.

## Deploying

We're using Github Actions for deployment.

### How it works

The Github Action invokes the [RedHatInsights/insights-frontend-builder-common//bootstrap.sh](https://raw.githubusercontent.com/RedHatInsights/insights-frontend-builder-common/master/src/bootstrap.sh) script, which builds the local branch and pushes the results to [RedHatInsights/ansible-hub-ui-build](https://github.com/RedHatInsights/ansible-hub-ui-build/branches). There, a separate Jenkins process awaits.

- any push to the `master` branch will deploy to `ansible-hub-ui-build` branches `ci-beta` and `qa-beta`
- any push to the `master-stable` branch will deploy to `ansible-hub-ui-build` branches `ci-stable` and `qa-stable`
- any push to the `prod-beta` branch will deploy to a `ansible-hub-ui-build` `prod-beta` branch
- any push to the `prod-stable` branch will deploy to a `ansible-hub-ui-build` `prod-stable` branch
- the `ansible-hub-ui-build` `master` branch is not used, as PRs against `master` end up in `ci-beta` and `qa-beta`

- `ci-beta` builds end up on `ci.console.redhat.com/beta`
- `ci-stable` builds end up on `ci.console.redhat.com`
- `qa-beta` builds end up on `qa.console.redhat.com/beta`
- `qa-stable` builds end up on `qa.console.redhat.com`
- `prod-beta` builds end up on `console.redhat.com/beta`
- `prod-stable` builds end up on `console.redhat.com`

### Workflows

List of all workflows:

- `backported-labels`: Add a backported-* label when a PR is backported to stable-*; on patchback merges
- `cloud-stage-cron`: Deploy master to master-stable when enabled, trigger `deploy-cloud`; cron
- `cloud-stage-disable`: Disable cron deploy from master; manual
- `cloud-stage-enable`: Enable cron deploy from master; manual
- `cypress`: Run Cypress integration tests; on PRs, pushes and cron
- `deploy-cloud`: Deploy to c.r.c; when the relevant branch is updated
- `dev-release`: Build and upload to github releases, update `dev` tag; when master is updated
- `i18n`: Extract and merge l10n strings for 4.4+; cron
- `pr-checks`: Check for linter errors, obsolete package-lock.json and merge commits; on PRs only
- `stable-release`: Build and upload to github releases; when a stable release is created
- `update-manifest`: Update https://github.com/RedHatInsights/manifests ; when master is updated

List by branches:

- `master`: `backported-labels`, `cloud-stage-cron`, `cypress`, `deploy-cloud`, `dev-release`, `i18n`, `pr-checks`, `stable-release`, `update-manifest`
- `master-stable`: `deploy-cloud`
- `prod-beta`: `deploy-cloud`
- `prod-stable`: `deploy-cloud`
- `stable-4.2`: `backported-labels`, `pr-checks`, `stable-release`
- `stable-4.3`: `backported-labels`, `cypress`, `pr-checks`, `stable-release`
- `stable-4.4`: `backported-labels`, `cypress`, `pr-checks`, `stable-release` (and `i18n` via cron from master)
- `stable-4.5`: `backported-labels`, `cypress`, `pr-checks`, `stable-release` (and `i18n` via cron from master)

## Patternfly

- This project imports Patternfly components:
  - [Patternfly React](https://github.com/patternfly/patternfly-react)

## Insights Components

Insights Platform will deliver components and static assets through [npm](https://www.npmjs.com/package/@red-hat-insights/insights-frontend-components). [insights-chrome](https://github.com/RedHatInsights/insights-chrome) takes care of the header, sidebar, and footer.

## UI Testing

For more information about UI testing go to [test README](https://github.com/ansible/ansible-hub-ui/tree/master/test/README.md).
