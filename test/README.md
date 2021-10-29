# Ansible Hub UI Testing

These are the integration tests for Ansible Hub UI. Please run the tests before commiting or merging
new UI functionality, or before changes to existing functionality.

## Run the Tests in Docker

To run the tests very quickly without any pre-requisite setup (other than Docker) simply do:

    npm run test

### Configuring the Test Container

The test container, by default, runs tests against `http://localhost:8002/`, the default location a development environment for galaxy_ng.

A `cypress.env.json` in your test directory will be copied into the container to configure your tests.

The settings can be changed by setting these environment variables.

    HUB_SERVER = "localhost:8002"
    HUB_UI_LOCATION = "${SCRIPTDIR}/../"
    CYPRESS_PREFIX = "/api/automation-hub/"
    CYPRESS_BASE_URL = "http://localhost:8002"
    CYPRESS_USERNAME = "admin"
    CYPRESS_PASSWORD = "admin"

## Setup the Tests Natively

### Install test dependencies

These are separate from the project's own dependencies. Run the following from the /test directory

    npm ci

### Prepare your `cypress.env.json`

The tests need to know details about the instance of Automation Hub that it's running against. Create a file named `cypress.env.json` in the test/ directory, and use the below example as a template or start by copying `cypress.env.json.template`.

    {
        "baseUrl": "http://localhost:8002/",
        "prefix": "<api root>",
        "username": "<your username here>",
        "password": "<your password here>",
        "settings": "../../galaxy_ng/galaxy_ng/app/settings.py",
        "restart": "true"
    }

*note*: the api root for the docker development environment of ansible/galaxy\_ng is `/api/automation-hub/`, while pulp-oci-images uses `/api/galaxy/`.

*note*: `settings` should point to galaxy\_ng `settings.py` relative to the `test/` folder, `restart` is a command to restart the server, true works in development because the server is watching for changes.

## Run the Tests Directly

Tests must be run from inside the test/ directory.

    cd test

The tests can be run in two modes: CLI or GUI. To run the tests in headless CLI mode, run one of the following based on the browser you'd like to test under:

    npm run cypress:chrome

    npm run cypress:chromium

    npm run cypress:firefox

To run the tests in GUI mode, which opens the Cypress interface and an embedded browser in which to
observe and inspect test runs:

    npm run cypress

After the tests have run you can view a video recording of the run is test/cypress/videos.

## Learn more

See Cypress documentation:
    https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests.html#Folder-Structure

# Guidelines

Please start by reading [Cypress best practices](https://docs.cypress.io/guides/references/best-practices).

`before`:
  * start with cleanup, see `cy.deleteTestUsers()` etc
  * initialize dependencies using `cy.galaxykit` (or helpers, do not use the UI); see GalaxyKit Integration section below

`beforeEach`:
  * use for `cy.login` + `cy.visit('/')` if all tests use the same login, then individual tests can start with `cy.menuGo`

`it`:
  * start with `cy.login` (only) if necessary
  * do `cy.visit` or `cy.menuGo` to ensure the right place

`it` + UI helpers:
  * always make sure to wait for the last thing that happens automatically when initiating a user action
  * for example, when adding a user, waiting for the API response is not enough, since the UI then redirects to the user list screen => wait for the Users list screen to finish loading

`after` / `afterEach`:
  * don't use; won't run after failures anyway
  * consider doing galaxykit based cleanup from `after` as well as in `before`
    * only a convenience to declutter
    * can't rely on it

## GalaxyKit Integration

In order to help manage test data, our Cypress setup includes wrappers around the galaxykit command. The galakxykit command is an interface to the GalaxyNG API.

You can install the dependency on your machine with pip, the Python dependency manager:

    pip install galaxykit

At this time, galaxykit is exposed in three commands: galaxykit, deleteTestUsers, and deleteTestGroups.

### cy.deleteTestUsers()

This command will delete any users in the system with the word "test" in their name.

### cy.deleteTestGroups()

This command will delete any groups in the system with the word "test" in the name.

### cy.galaxykit(command, ...args)

This low-level wrapper allows you to call any sub-command of the galaxykit tool. Extra parameters will be escaped safely for the shell.

You may use these commands:

* cy.galaxykit("user create", username, password)
* cy.galaxykit("user delete", username)
* cy.galaxykit("user group add", username)
* cy.galaxykit("group create", name)
* cy.galaxykit("group delete", name)
* cy.galaxykit("namespace create", name, [initial group])
* cy.galaxykit("namespace addgroup", namespace, group)
* cy.galaxykit("namespace removegroup", namespace, group)

see [command.py](https://github.com/ansible/galaxykit/blob/main/galaxykit/command.py) for more.
