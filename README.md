# Ansible Automation Hub UI

Frontend for Ansible Automation Hub. The backend for this project can be [found here](https://github.com/ansible/galaxy_ng/).

# Setting up Your Dev Environment

## Develop using Docker Compose (Recommended)

This project can now be run as a container alongside the API. Just follow the instructions on the [ansibe/galaxy_ng wiki](https://github.com/ansible/galaxy_ng/wiki/Development-Setup).

## Develop without containers

This app can be developed in standalone mode or insights mode. Insights mode compiles the app to be run on the Red Hat cloud services platform (insights) and requires access to the Red Hat VPN as well as the insights proxy. Standalone mode only requires a running instance of the galaxy API for the UI to connect to.

### Develop in Standalone Mode

1. Clone the [galaxy_ng](https://github.com/ansible/galaxy_ng) repo and follow the instructions for starting up the API.
2. Install node. Node v16+ is known to work. Older versions may work as well.
3. `npm install`
4. `npm run start-standalone`

The app will run on http://localhost:8002 and proxy requests for `api/automation-hub` to the api on `http://localhost:5001`.

## Patternfly

- This project imports Patternfly components:
  - [Patternfly React](https://github.com/patternfly/patternfly-react)

## Insights Components

Insights Platform will deliver components and static assets through [npm](https://www.npmjs.com/package/@red-hat-insights/insights-frontend-components). ESI tags are used to import the [chroming](https://github.com/RedHatInsights/insights-chrome) which takes care of the header, sidebar, and footer.

## UI Testing

For more information about UI testing go to [test README](https://github.com/ansible/ansible-hub-ui/tree/master/test/README.md).
