// https://on.cypress.io/custom-commands
const apiPrefix = Cypress.env('apiPrefix');

const sessionOptions = {
  validate: () =>
    cy.request(`${apiPrefix}_ui/v1/me/`).its('status').should('eq', 200),
};

function apiLogin(username, password) {
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
    sessionOptions,
  );

  cy.visit('/');
}

Cypress.Commands.add('login', {}, (username, password) => {
  if (!username && !password) {
    // default to admin
    username = Cypress.env('username');
    password = Cypress.env('password');
  }

  apiLogin(username, password);
});
