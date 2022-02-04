import { range } from 'lodash';

describe('Clearing of database test.', () => {
  before(() => {
    cy.clearDatabase();
    cy.galaxykit('user create', 'DeleteTestUser', '123abcdpassword');
  });

  beforeEach(() => {
    cy.login();
    cy.visit('/ui/users');
    cy.get('table[aria-label="User list"]').contains('admin');
  });

  it('should see DeleteTestUser', () => {
    cy.contains('DeleteTestUser');
    cy.clearDatabase();
  });

  it('should not see DeleteTestUser', () => {
    cy.contains('DeleteTestUser').should('not.exist');
    cy.galaxykit('user create', 'DeleteTestUser', '123abcdpassword');
  });

  it('should see DeleteTestUser again', () => {
    cy.contains('DeleteTestUser');
    cy.clearDatabase();
  });

  it('should not see DeleteTestUser again', () => {
    cy.contains('DeleteTestUser').should('not.exist');
    cy.clearDatabase();
  });

  it('should do it repeatedly', () => {
    function before() {
      cy.login();
      cy.visit('/ui/users');
      cy.get('table[aria-label="User list"]').contains('admin');
    }

    range(3).forEach(() => {
      cy.clearDatabase();
      cy.galaxykit('user create', 'DeleteTestUser', '123abcdpassword');

      before();
      cy.contains('DeleteTestUser');
      cy.clearDatabase();

      before();
      cy.contains('DeleteTestUser').should('not.exist');
      cy.clearDatabase();
    });
  });
});
