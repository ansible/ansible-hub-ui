# Ansible Hub UI Testing

These are the integration tests for Ansible Hub UI. Please run the tests before commiting or merging
new UI functionality, or before changes to existing functionality.

## Setup the Tests

Simple install the requisite test dependencies. These are separate from the project's own dependencies:

    npm ci

## Run the Tests

The tests can be run in two modes: CLI or GUI. To run the tests in headless CLI mode:

    node_modules/.bin/cypress open

To run the tests in GUI mode, which opens the Cypress interface and an embedded browser in which to
observe and inspect test runs:

    node_modules/.bin/cypress run

## Learn more

See Cypress documenation:
    https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests.html#Folder-Structure
