# Ansible Hub UI Testing

These are the integration tests for Ansible Hub UI. Please run the tests before commiting or merging
new UI functionality, or before changes to existing functionality.

## Setup the Tests

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

## Run the Tests

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
