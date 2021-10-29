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
        "restart": "true",
        "containers": "localhost:5001"
    }

*note*: the api root for the docker development environment of ansible/galaxy\_ng is `/api/automation-hub/`, while pulp-oci-images uses `/api/galaxy/`.

*note*: `settings` should point to galaxy\_ng `settings.py` relative to the `test/` folder, `restart` is a command to restart the server, true works in development because the server is watching for changes.

*note*: `containers` is what you would use with `docker push`/`podman push` to add a local container

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


## Checklists

### List screen

name like `$collection-list.js` (using camel\_case for collection name, singular)

* before: delete all data of that collection, prepare only dependencies (`galaxykit`)
* test empty state (no data)
  * mock API responses if it's not possible to remove all items
* check error screens when a request fails with 400, 401/3, 404, 500
  * mock API responses
* check loading state
  * mock API response to wait for a promise before returning a response
* nested describe with a `before` to set up real data (`galaxykit`)
* check title, columns, sanity check data
* check filter, empty state filter
* check perpage and paging (can set to 2)
* check sort, do it from page 2, should reset page to 1
* check screen actions, list item actions
  * skip create/edit, those should live in a form screen test
  * prefer to test nontrivial extra actions (including delete) in a separate per-feature test .. which can test both list/detail screen for that button
  * test the rest
* [NOT YET] switch to a user with only the relevant permissions per test, not admin (needs permission-aware helpers first) .. only need the Foo button in foo action test, can test not in list screen

### Detail screen

name like `$collection-detail.js`

* before: delete all data of that collection, set up an entity per each tested type (local/remote, etc.) (`galaxykit`)
* test error state (404, 401/3, 400, 500)
* test loading state
* if there are tabs, make sure to test every available tab
* test any actions not tested in a shared action test
* make sure some relevant details appear
* if there are multiple types of an entity, test the differences by having a test for each type
* [NOT YET] switch to a user with only the relevant permissions per test, not admin

### Form screen

name like `$collection-form.js`

* before: set up any dependencies (if the form has any selects that need populating) (`galaxykit`)
* treat new and edit as separate tests (possibly with shared parts), test both
* test saveability vs required fields
* have one test submit the form with minimal valid data
* have one test submit the form filling out all possible fields
* test a submit with an error response, test that an alert appears
  * may need to mock the API response if there's no server-side validation
* test load failures (edit failing to load the entity, or either mode failing to load some other data it depends on)

### Actions

name like `$collection-$action.js` (using camel\_case for both collection name and action name)

* test the action on each available screen
  * prefer to loop the same test over an array of "get me there" functions (see [`execution_environments_use_in_controller.js`](https://github.com/ansible/ansible-hub-ui/blob/master/test/cypress/integration/execution_environments_use_in_controller.js#L53-L83) for an example)
* make sure to wait until every request associated with submitting that action ends, including tasks, and subsequent list screen reloads

## GalaxyKit Integration

In order to help manage test data, our Cypress setup includes wrappers around the galaxykit command. The galakxykit command is an interface to the GalaxyNG API.

You can install the dependency on your machine with pip, the Python dependency manager:

    pip install galaxykit

At this time, galaxykit is exposed in three commands: galaxykit, deleteTestUsers, and deleteTestGroups.

### cy.deleteTestUsers()

This command will delete any users in the system.

### cy.deleteTestGroups()

This command will delete any groups in the system.

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
