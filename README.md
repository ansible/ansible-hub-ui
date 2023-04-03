# Ansible Automation Hub UI

Frontend for Ansible Automation Hub. The backend for this project can be [found here](https://github.com/ansible/galaxy_ng/).

# Setting up Your Dev Environment

## Develop using Docker Compose (Recommended)

This project can now be run as a container alongside the API. Just follow the instructions on the [ansibe/galaxy_ng wiki](https://github.com/ansible/galaxy_ng/wiki/Development-Setup).

## Develop without containers

This app can be developed in standalone, community, or insights mode. Insights mode compiles the app to be run on the Red Hat cloud services platform (insights). Standalone mode only requires a running instance of the galaxy API for the UI to connect to. Community mode is similar to standalone, with github login and Roles.

For every mode, you first need to:

1. Clone the [galaxy_ng](https://github.com/ansible/galaxy_ng) repo and follow the setup instructions
2. Install node. Node v16+ is known to work. Older versions may work as well.
3. `npm install` in the UI

### Develop in Standalone Mode (default)

1. Start the API with `COMPOSE_PROFILE=standalone` (compose) or `COMPOSE_PROFILE=galaxy_ng/base` (oci-env)
2. `npm run start-standalone`

The app will run on http://localhost:8002/ui and proxy requests for `/api/automation-hub` to the api on `http://localhost:5001`.

### Develop in Community Mode

1. Start the API with `COMPOSE_PROFILE=standalone-community` (compose)
2. `npm run start-community`

The app will run on http://localhost:8002/ui and proxy requests for `/api` to the api on `http://localhost:5001`.

### Version mapping

Our branches, backport labels, releases and tags use AAH versions, but Jira uses AAP versions.
To map between the two:

|AAP version|AAH version|
|-|-|
|1.2|4.2|
|2.0|4.3 (obsolete)|
|2.1|4.4|
|2.2|4.5|
|2.3|4.6|

## Patternfly

- This project imports Patternfly components:
  - [Patternfly React](https://github.com/patternfly/patternfly-react)

## Insights Components

Insights Platform will deliver components and static assets through [npm](https://www.npmjs.com/package/@red-hat-insights/insights-frontend-components). [insights-chrome](https://github.com/RedHatInsights/insights-chrome) takes care of the header, sidebar, and footer.

## UI Testing

For more information about UI testing go to [test README](https://github.com/ansible/ansible-hub-ui/tree/master/test/README.md).
