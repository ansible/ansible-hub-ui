// https://on.cypress.io/custom-commands
const apiPrefix = Cypress.env('apiPrefix');

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
            headers: {
              'X-CSRFToken': csrftoken.value,
              Referer: Cypress.config().baseUrl,
            },
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
  cy.assertTitle(title);
}

Cypress.Commands.add('login', {}, (username, password, url, title) => {
  if (!username && !password) {
    // default to admin
    username = Cypress.env('username');
    password = Cypress.env('password');
  }

  apiLogin(username, password, url, title);
});
