# Ansible Automation Hub UI

Frontend for Ansible Hub and Galaxy. The backend for this project can be found at [ansible/galaxy\_ng](https://github.com/ansible/galaxy_ng/),
developer docs at [ansible.readthedocs.io](https://ansible.readthedocs.io/projects/galaxy-ng/en/latest/), and an outdated wiki at [ansibe/galaxy\_ng wiki](https://github.com/ansible/galaxy_ng/wiki/Development-Setup).

The project is built on React & Patternfly, using components from [patternfly-react](https://github.com/patternfly/patternfly-react), with [lingui](https://github.com/lingui/js-lingui/) for l10n.


## Setting up Your Dev Environment

### Backend

The development version of the backend runs in a container, using the [pulp/oci\_env](https://github.com/pulp/oci_env) wrapper.

Set up:

```bash
git clone https://github.com/pulp/oci_env
git clone https://github.com/ansible/galaxy_ng

pip install -e oci_env/client/
oci-env # make sure oci-env is in PATH
```

Run:

```bash
cd galaxy_ng
make oci/standalone
```

The backend can be run in multiple modes:

- `standalone`;
- `community`;
- `insights`;
- `keycloak`;
- `ldap`;
- `dab`.

Depending on the mode, it will listen on http://localhost:5001 or http://localhost:55001, under `/api/galaxy/`, `/api/` or `/api/automation-hub/`.


### Frontend

UI can run either as part of the backend container, or locally. The development version of the frontend uses webpack dev server.

Set up:

Install [NodeJS](https://nodejs.org/). Node v20+ is known to work. Other versions may work as well.

```bash
git clone https://github.com/ansible/ansible-hub-ui
cd ansible-hub-ui
npm install
```

Run:

```bash
cd ansible-hub-ui
npm run start-standalone
```

This app can be developed in standalone, community, or insights mode. Insights mode compiles the app to be run on the Red Hat cloud services platform (Insights). Standalone mode only requires a running instance of the galaxy API for the UI to connect to. Community mode is similar to standalone, with GitHub login and roles.


#### Modes

| Mode               | Assume                        | Links                                                                                                |
|--------------------|-------------------------------|------------------------------------------------------------------------------------------------------|
| `start-standalone` | `oci/standalone` or `oci/dab` | http://localhost:8002/ui/ and http://localhost:55001/api/galaxy/                                     |
| `start-community`  | `oci/community`               | http://localhost:8002/ui/ and http://localhost:5001/api/                                             |
| `start-insights`   | `oci/insights`                | http://localhost:8002/preview/ansible/automation-hub/ and http://localhost:55001/api/automation-hub/ |

**NOTE:** `start-insights` option is only relevant to Red Hat employees.


### Tests

For more information about UI testing go to [test/README.md](./test/README.md).

1. Set up:

    ```bash
    pip install galaxykit ansible
    cd ansible-hub-ui/test/
    npm install
    ```

1. Create a `cypress.env.json` from the `cypress.env.json.template` template.

1. Run:

    ```bash
    cd ansible-hub-ui/test/
    npm run cypress
    ```


## GitHub Workflows

List of all workflows:

- `backported-labels`: Add a `backported-*` label when a PR is backported to `stable-*`; on patchback merges
- `cypress`: Run Cypress integration tests; on PRs, pushes and cron
- `dev-release`: Build and upload to GitHub releases, update `dev` tag; when master is updated
- `i18n`: Extract and merge l10n strings; cron
- `pr-checks`: Check for linter errors, obsolete `package-lock.json` and merge commits; on PRs only
- `stable-release`: Build and upload to GitHub releases; when a stable release is created

List by branches:

- `master`:

    - `backported-labels`
    - `cypress`
    - `dev-release`
    - `i18n`
    - `pr-checks`
    - `stable-release`

- `stable-*`:

    - `backported-labels`
    - `cypress`
    - `i18n` (via cron from master)
    - `pr-checks`
    - `stable-release`


## Version mapping

Our branches, backport labels, releases and tags use AAH versions, but Jira uses AAP versions.
To map between the two:

| AAP version | AAH version |
|-------------|-------------|
| 2.4         | 4.9         |

[Table with component versions](https://github.com/ansible/galaxy_ng/wiki/Galaxy-NG-Version-Matrix)
