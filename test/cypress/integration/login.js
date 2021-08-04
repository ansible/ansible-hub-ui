describe('Login helpers', () => {
  let adminUsername = Cypress.env('username');
  let adminPassword = Cypress.env('password');
  let username = 'nopermission';
  let password = 'n0permissi0n';

  before(() => {
    cy.deleteTestUsers();
    cy.galaxykit('user create', username, password);
  });

  /*it('can login manually and logout as admin or different user', () => {
    cy.login(username, password);
    cy.contains(username);
    cy.logout();
    cy.login(adminUsername, adminPassword);
    cy.contains(adminUsername);
  });

  it('can login as user and store cookie', () => {
    cy.cookieLogin(username, password);
    cy.contains(username);
  });

  it('can login as admin and store cookie', () => {
    cy.cookieLogin(adminUsername, adminUsername);
    cy.contains(adminUsername);
  });

  it('it can switch back to user using cookie storage', () => {
    cy.cookieLogin(username, password);
    cy.contains(username);
  });

  it('it can switch back to admin using cookie storage', () => {
    cy.cookieLogin(adminUsername, adminUsername);
    cy.contains(adminUsername);
  });

  it('can cookieLogin without cookie removal between its as admin or different user', () => {
    cy.cookieLogin(username, password);
    cy.contains(username);

    cy.cookieLogin(adminUsername, adminPassword);
    cy.contains(adminUsername);
  });

  it('can cookieLogin with logout as admin or different user - this will force to login manualy every time', () => {
    cy.cookieLogin(username, password);
    cy.contains(username);
    cy.cookieLogout();
    cy.getCookies().then((cookies) => {
      let sessionid = null;
      let csrftoken = null;

      cookies.forEach((cookie) => {
        if (cookie.name == 'sessionid') {
          sessionid = cookie.value;
        }
        if (cookie.name == 'csrftoken') {
          csrftoken = cookie.value;
        }
      });

      cy.expect(sessionid).to.be.null;
      cy.expect(csrftoken).to.be.null;
    });
    cy.getUserTokens((user_tokens) => {
      cy.expect(user_tokens).to.eql({});
    });
    cy.cookieLogin(adminUsername, adminPassword);
    cy.contains(adminUsername);
  });*/

  it('can login again to user that has been deleted and created again', () => {
    cy.deleteTestUsers();
    cy.deleteTestGroups();
    let groupName = 'testGroup';
    let userName = 'testUser12345';

    for (var i = 0; i <= 1; i++) {
      cy.cookieLogin(adminUsername, adminPassword);
      cy.createGroup(groupName);
      cy.createUser(userName, userName);
      cy.addUserToGroup(groupName, userName);
      cy.cookieLogin(userName, userName);
      cy.deleteTestUsers();
      cy.deleteTestGroups();
    }
  });
});
