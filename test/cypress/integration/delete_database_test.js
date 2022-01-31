import { range, sortBy } from 'lodash';

describe('Clearing of database test.', () => {
  before(() => {
    cy.clearDatabase();
    cy.galaxykit('user create', 'DeleteTestUser', '123abcdpassword');
  });

  after(() => {
    cy.clearDatabase();
  });

  beforeEach(() => {
    cy.login();
    cy.visit('/ui/users');
  });

  it('should see DeleteTestUser', () => {
    cy.contains('DeleteTestUser');
    cy.clearDatabase();
  });

  it('should not see DeleteTestUser', () => {
    cy.contains('DeleteTestUser').should('not.exist');
  });
});
