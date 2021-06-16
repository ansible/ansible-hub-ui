# Ansible Automation Hub UI

Frontend for Ansible Automation Hub. The backend for this project can be [found here](https://github.com/ansible/galaxy_ng/).

# Setting up Your Dev Environment

## Develop using Docker Compose (Recommended)

This project can now be run as a container alongside the API. Just follow the instructions on the [ansibe/galaxy_ng wiki](https://github.com/ansible/galaxy_ng/wiki/Development-Setup).

## Develop without containers

This app can be developed in standalone mode or insights mode. Insights mode compiles the app to be run on the Red Hat cloud services platform (insights) and requires access to the Red Hat VPN as well as the insights proxy. Standalone mode only requires a running instance of the galaxy API for the UI to connect to.

### Develop in Standalone Mode

1. Clone the [galaxy_ng](https://github.com/ansible/galaxy_ng) repo and follow the instructions for starting up the API.
2. Install node. Node v13+ are known to work. Older versions may work as well.
3. `npm install`
4. `npm run start-standalone`

The app will run on http://localhost:8002 and proxy requests for `api/automation-hub` to the api on `http://localhost:5001`.

### Develop in Insights Mode

**NOTE:** This option is only available to Red Hat employees who have access to the Red Hat VPN. Community contributors should follow setup for [standalone mode](#develop-in-standalone-mode)

To enable insights mode set `DEPLOYMENT_MODE: 'insights'` in [custom.dev.config.js](./custom.dev.config.js).

This app is part of the Red Hat cloud platform. Because of that the app needs to be loaded within the context of cloud.redhat.com. This is done by accessing the app via the [insights-proxy project](https://github.com/RedHatInsights/insights-proxy).

#### Set up Insights Proxy

- Install docker
- Clone this repo `git@github.com:RedHatInsights/insights-proxy.git` to your machine
- Inside the `insights-proxy/` directory on your computer, run the following scripts
  - `npm install`
  - `bash scripts/update.sh` This updates the insights proxy container to the latest version.
  - `sudo bash scripts/patch-etc-hosts.sh` This adds the following entries to your `/etc/hosts` file

```
127.0.0.1 prod.foo.redhat.com
127.0.0.1 stage.foo.redhat.com
127.0.0.1 qa.foo.redhat.com
127.0.0.1 ci.foo.redhat.com
```

Once all this is done, you can launch `insights-proxy` with this command:

```
SPANDX_CONFIG=/path/to/ansible-hub-ui/profiles/local-frontend-and-api.js bash /path/to/insights-proxy/scripts/run.sh
```

This should launch `insights-proxy`, which will redirect the routes defined in `profiles/local-frontend-and-api.js` to the automation hub UI running locally on your machine.

##### NOTE

If you are on a Mac, you might have to make a small change to the `insights-proxy/scripts/run.sh` script. Update this line

```
REALPATH=`python2 -c 'import os,sys;print os.path.realpath(sys.argv[1])' $SPANDX_CONFIG`
```

to use `python` instead of `python2`.

#### Run Automation Hub

Once the insights proxy is running, open a new terminal, navigate to your local copy of `ansible-hub-ui` and execute

1. `npm install`
2. `npm run start`

To access the app, visit: https://ci.foo.redhat.com:1337/insights/automation-hub

## Deploying

We're using Github Actions for deployment.

### How it works

The Github Action invokes the [RedHatInsights/insights-frontend-builder-common//bootstrap.sh](https://raw.githubusercontent.com/RedHatInsights/insights-frontend-builder-common/master/src/bootstrap.sh) script, which builds the local branch and pushes the results to [RedHatInsights/ansible-hub-ui-build](https://github.com/RedHatInsights/ansible-hub-ui-build/branches). There, a separate Jenkins process awaits.

- any push to the `master` branch will deploy to `ansible-hub-ui-build` branches `ci-beta` and `qa-beta`
- any push to the `master-stable` branch will deploy to `ansible-hub-ui-build` branches `ci-stable` and `qa-stable`
- any push to the `prod-beta` branch will deploy to a `ansible-hub-ui-build` `prod-beta` branch
- any push to the `prod-stable` branch will deploy to a `ansible-hub-ui-build` `prod-stable` branch
- the `ansible-hub-ui-build` `master` branch is not used, as PRs against `master` end up in `ci-beta` and `qa-beta`

- `ci-beta` builds end up on `ci.cloud.redhat.com/beta`
- `ci-stable` builds end up on `ci.cloud.redhat.com`
- `qa-beta` builds end up on `qa.cloud.redhat.com/beta`
- `qa-stable` builds end up on `qa.cloud.redhat.com`
- `prod-beta` builds end up on `cloud.redhat.com/beta`
- `prod-stable` builds end up on `cloud.redhat.com`

### Workflows

- `master`: `cypress`, `deploy-cloud`, `dev-release`, `stable-release`, `update-manifest`
- `master-stable`: `deploy-cloud`
- `prod-beta`: `deploy-cloud`
- `prod-stable`: `deploy-cloud`
- `stable-4.2`: `stable-release`
- `stable-4.3`: `cypress`, `stable-release`

## Patternfly

- This project imports Patternfly components:
  - [Patternfly React](https://github.com/patternfly/patternfly-react)

## Insights Components

Insights Platform will deliver components and static assets through [npm](https://www.npmjs.com/package/@red-hat-insights/insights-frontend-components). ESI tags are used to import the [chroming](https://github.com/RedHatInsights/insights-chrome) which takes care of the header, sidebar, and footer.

## UI Testing

For more information about UI testing go to [test README](https://github.com/ansible/ansible-hub-ui/tree/master/test/README.md).
