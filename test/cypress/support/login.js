// https://on.cypress.io/custom-commands
const apiPrefix = Cypress.env('apiPrefix');
const uiPrefix = Cypress.env('uiPrefix');
const insightsLogin = Cypress.env('insightsLogin');

function apiLogin(username, password, url = '/', title = 'Collections') {
  cy.session(
    ['apiLogin', username],
    () => {
      const loginUrl = `${apiPrefix}_ui/v1/auth/login/`;
      cy.request('GET', loginUrl).then(() => {
        cy.getCookie('csrftoken').then((csrftoken) => {
          cy.request({
            method: 'POST',
            url: loginUrl,
            body: { username, password },
            headers: { 'X-CSRFToken': csrftoken.value },
          });
        });
      });
    },
    {
      validate: () =>
        cy.request(`${apiPrefix}_ui/v1/me/`).its('status').should('eq', 200),
    },
  );

  cy.visit(url);
  cy.contains('.pf-c-title', title);
}

function manualCloudLogin(username, password) {
  cy.session(
    ['manualCloudLogin', username],
    () => {
      cy.visit(uiPrefix);

      cy.get('input[id^="username"]').type(username);
      cy.get('input[id^="password"').type(`${password}{enter}`);

      // wait for the user menu
      cy.get('#UserMenu');
    },
    {
      validate: () => {
        cy.visit(uiPrefix);
        cy.get('#UserMenu');
      },
    },
  );

  cy.on('uncaught:exception', () => false);
  cy.visit(uiPrefix);
  cy.get('#UserMenu');
}

Cypress.Commands.add('login', {}, (username, password, url, title) => {
  if (!username && !password) {
    // default to admin
    username = Cypress.env('username');
    password = Cypress.env('password');
  }

  if (insightsLogin) {
    manualCloudLogin(username, password);
  } else {
    apiLogin(username, password, url, title);
  }
});
