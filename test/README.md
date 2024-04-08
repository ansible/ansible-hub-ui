# Ansible Hub UI testing

These are the integration tests for Ansible Hub UI. Please run the tests before merging.


## Setup the tests

### Install test dependencies

These are separate from the project's own dependencies. Run the following from the `test/` directory

    npm install


### Prepare your `cypress.env.json`

The tests need to know details about the instance of Automation Hub that it's running against. Create a file named `cypress.env.json` in the `test/` directory, and use the below example as a template, or start by copying `cypress.env.json.template`.

    {
        "apiPrefix": "<api root>",
        "uiPrefix": "<ui base path>",
        "username": "<your username here>",
        "password": "<your password here>",
        "containers": "<container push target>",
        "galaxykit": "<galaxykit command>"
    }


*NOTE*: the likely values for `apiPrefix` are `/api/` (community), `/api/automation-hub/` (insights), or `/api/galaxy/` (standalone).

*NOTE*: `containers` is what you would use with `docker push`/`podman push` to add a local container, eg. `localhost:5001`


## Run the tests

Tests must be run from inside the `test/` directory.

    cd test


The tests can be run in two modes: CLI or GUI. To run the tests in headless CLI mode, run one of the following based on the browser you'd like to test under:

    npm run cypress:chrome

    npm run cypress:chromium

    npm run cypress:firefox


To run the tests in GUI mode, which opens the Cypress interface and an embedded browser in which to observe and inspect test runs:

    npm run cypress


After the tests have run you can view a video recording of the run is `test/cypress/videos`.


## Learn more

See [Cypress documentation](https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests),
and [Cypress best practices](https://docs.cypress.io/guides/references/best-practices).


## Guidelines

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
  * (NOTE: negative tests (`.should('not.exist')`) do NOT wait.)

`after` / `afterEach`:
  * don't use; won't run after failures anyway
  * consider doing galaxykit based cleanup from `after` as well as in `before`
    * only a convenience to declutter
    * can't rely on it


## `galaxykit` integration

In order to help manage test data, our Cypress setup includes wrappers around the galaxykit command. The galakxykit command is an interface to the GalaxyNG API.

You can install the dependency on your machine with pip, the Python dependency manager:

    pip install galaxykit ansible


### cy.galaxykit(command, ...args)

This low-level wrapper allows you to call any sub-command of the galaxykit tool. Extra parameters will be escaped safely for the shell.

For a list of commands, use `galaxykit --help`, `galaxykit <command> --help` and so forth, or see [command.py](https://github.com/ansible/galaxykit/blob/main/galaxykit/command.py).

Example use:

* `cy.galaxykit("user create", username, password)`
* `cy.galaxykit("group delete", name)`
