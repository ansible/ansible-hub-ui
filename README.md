# Ansible Automation Hub UI

Frontend for Ansible Hub and Galaxy. The backend for this project can be found at [ansible/galaxy\_ng](https://github.com/ansible/galaxy_ng/),
developer docs at [ansible.readthedocs.io](https://ansible.readthedocs.io/projects/galaxy-ng/en/latest/), and an outdated wiki at [ansibe/galaxy\_ng wiki](https://github.com/ansible/galaxy_ng/wiki/Development-Setup).

The project is built on React & Patternfly, using components from [patternfly-react](https://github.com/patternfly/patternfly-react), with [lingui](https://github.com/lingui/js-lingui/) for l10n.


## Setting up Your Dev Environment

### Backend

The development version of the backend runs in a container, using the [pulp/oci\_env](https://github.com/pulp/oci_env) wrapper.

Set up:

```
git clone https://github.com/pulp/oci_env
git clone https://github.com/ansible/galaxy_ng -b stable-4.9

pip install -e oci_env/client/
oci-env # make sure oci-env is in PATH
```

Run:

```
cd galaxy_ng
make oci/standalone
```

The backend can be run in multiple modes - `standalone`, `keycloak` and `ldap`.
It will listen on http://localhost:55001, under `/api/galaxy/`.


### Frontend

UI can run either as part of the backend container, or locally. The development version of the frontend uses webpack dev server.

Set up:

Install node. Node v20+ is known to work. Other versions may work as well.

```
git clone https://github.com/ansible/ansible-hub-ui -b stable-4.9
cd ansible-hub-ui
npm install
```

Run:

```
cd ansible-hub-ui
npm run start-standalone
```

Standalone mode only requires a running instance of the galaxy API for the UI to connect to.


#### Modes

* `start-standalone`: assumes `oci/standalone`, http://localhost:8002/ui/ and http://localhost:55001/api/galaxy/


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
