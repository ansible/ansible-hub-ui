// https://on.cypress.io/custom-commands
const apiPrefix = Cypress.env('apiPrefix');

const setFormData = (username, password) => {
  const formData = new FormData();
  formData.set('username', username);
  formData.set('password', password);
  return formData;
};

function apiLogin(
  username,
  password,
  url,
  title = 'Collections',
  isGateway = false,
) {
  cy.session(
    ['apiLogin', username],
    () => {
      const loginUrl = isGateway
        ? `/api/gateway/v1/login/`
        : `${apiPrefix}_ui/v1/auth/login/`;
      cy.request('GET', loginUrl).then(() => {
        cy.getCookie('csrftoken').then((csrf) => {
          const csrfToken = csrf.value;

          const headers = {
            'X-CSRFToken': csrfToken,
            Referer: Cypress.config().baseUrl,
          };

          if (isGateway) {
            headers['content-type'] = 'multipart/form-data';
            headers['Set-Cookie'] = `csrftoken=${csrfToken}`;
          }

          const body = isGateway
            ? setFormData(username, password)
            : { username, password };

          cy.request({
            method: 'POST',
            url: loginUrl,
            body,
            headers,
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

Cypress.Commands.add('login', {}, (username, password, url = '/', title) => {
  if (!username && !password) {
    // default to admin
    username = Cypress.env('username');
    password = Cypress.env('password');
  }

  cy.log('gateway', Cypress.env('HUB_GATEWAY'));

  const isGateway =
    ['1', 1, 'true', true].includes(Cypress.env('HUB_GATEWAY')) || false;

  // redirects to HUB full experience /ui/
  const gwHubPrefix = '/ui/';

  const loginUrl = isGateway ? gwHubPrefix : url;

  apiLogin(username, password, loginUrl, title, isGateway);
});
