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

The tests need to know details about the instance of Automation Hub that it's running against. Create a file named `cypress.env.json` in the test/ directory, and use the below example as a template.

    {
        "host":"http://localhost:8002/",
        "prefix":"<api root>",
        "username": "<your username here>",
        "password": "<your password here>"
    }

*note*: the api root for the docker development environment of ansible/galaxy_ng is `api/automation-hub/`.

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
