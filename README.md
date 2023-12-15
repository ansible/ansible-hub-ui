# 4.8 End of life

The 4.8 branch is no longer maintained.

---

# Ansible Automation Hub UI

Frontend for Ansible Automation Hub. The backend for this project can be [found here](https://github.com/ansible/galaxy_ng/).

# Setting up Your Dev Environment

## Develop using Docker Compose (Recommended)

This project can now be run as a container alongside the API. Just follow the instructions on the [ansibe/galaxy_ng wiki](https://github.com/ansible/galaxy_ng/wiki/Development-Setup).

## Develop without containers

Standalone mode only requires a running instance of the galaxy API for the UI to connect to.

### Develop in Standalone Mode

1. Clone the [galaxy_ng](https://github.com/ansible/galaxy_ng) repo and follow the setup instructions
2. Start the API with `COMPOSE_PROFILE=standalone` (compose) or `COMPOSE_PROFILE=galaxy_ng/base` (oci-env)
3. Install node. Node v18+ is known to work. Older versions may work as well.
4. `npm install` in the UI
5. `npm run start-standalone`

The app will run on http://localhost:8002/ui and proxy requests for `/api/automation-hub` to the api on `http://localhost:5001`.

## Patternfly

- This project imports Patternfly components:
  - [Patternfly React](https://github.com/patternfly/patternfly-react)

## UI Testing

For more information about UI testing go to [test README](https://github.com/ansible/ansible-hub-ui/tree/stable-4.8/test/README.md).
