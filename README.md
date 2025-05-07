# Ansible Automation Hub UI

Frontend for Ansible Hub and Galaxy. The backend for this project can be found at [ansible/galaxy\_ng](https://github.com/ansible/galaxy_ng/),
developer docs at [ansible.readthedocs.io](https://ansible.readthedocs.io/projects/galaxy-ng/en/latest/), and an outdated wiki at [ansibe/galaxy\_ng wiki](https://github.com/ansible/galaxy_ng/wiki/Development-Setup).
Also read [developer\_guidelines](./developer_guidelines.md).

The project is built on React & Patternfly, using components from [patternfly-react](https://github.com/patternfly/patternfly-react), with [lingui](https://github.com/lingui/js-lingui/) for l10n.


## Setting up Your Dev Environment

### Backend

The development version of the backend runs in a docker-compose.

Set up:

```
git clone https://github.com/ansible/galaxy_ng

```

Run:

```
cd galaxy_ng
make compose/aap
```

The backend can be run in multiple modes - `standalone`, `community`, `insights`, `certified-sync` and `aap`.
Depending on the mode, it will listen on http://localhost:5001, under `/api/galaxy/`, `/api/` or `/api/automation-hub/`.

Or, use the [simplified compose stack](https://github.com/ansible/galaxy_ng/tree/master/dev/compose#galaxy-simplified-compose-stack).


### Frontend

UI can run either as part of the backend container, or locally. The development version of the frontend uses webpack dev server.

Set up:

Install node. Node v20+ is known to work. Other versions may work as well.

```
git clone https://github.com/ansible/ansible-hub-ui
cd ansible-hub-ui
npm install
```

Run:

```
cd ansible-hub-ui
API_PROXY=http://localhost:5001 npm run start-standalone
```

(Or run `API_PROXY=https://my-server.example.com npm run start-standalone` to run with external backend.)

This app can be developed in standalone, community, or insights mode. Insights mode compiles the app to be run on the Red Hat cloud services platform (insights). Standalone mode only requires a running instance of the galaxy API for the UI to connect to. Community mode is similar to standalone, with github login and roles.


#### Modes

* `start-standalone`: assumes `compose/standalone` or `compose/dab`, http://localhost:8002/ui/ and http://localhost:5001/api/galaxy/
* `start-community`: assumes `compose/community`, http://localhost:8002/ui/ and http://localhost:5001/api/
* `start-insights`: assumes `compose/insights`,  http://localhost:8002/preview/ansible/automation-hub/ and http://localhost:5001/api/automation-hub/
  * **NOTE:** This option is only relevant to Red Hat employees.


### Tests

For more information about UI testing go to [test/README.md](./test/README.md).

Set up:

```
pip install galaxykit ansible

cd ansible-hub-ui/test/
npm install
```

And create a `cypress.env.json` from the `cypress.env.json.template` template.

Run:

```
cd ansible-hub-ui/test/
npm run cypress
```


## GitHub Workflows

List of all workflows:

- `cypress`: Run Cypress integration tests; on PRs, pushes and cron
- `dev-release`: Build and upload to github releases, update `dev` tag; when master is updated
- `i18n`: Extract and merge l10n strings; cron
- `pr-checks`: Check for linter errors, obsolete package-lock.json and merge commits; on PRs only
- `stable-release`: Build and upload to github releases; when a stable release is created

List by branches:

- `master`: `cypress`, `dev-release`, `i18n`, `pr-checks`, `stable-release`
- `stable-*`: `cypress`, `i18n` (via cron from master), `pr-checks`, `stable-release`


## Version mapping

Our branches, backport labels, releases and tags use AAH versions, but Jira uses AAP versions.

[Table with component versions](https://github.com/ansible/galaxy_ng/wiki/Galaxy-NG-Version-Matrix)
