import { range, sortBy } from 'lodash';

describe('Approval Dashboard list tests for sorting, paging and filtering', () => {
  let items = [];

  before(() => {
    cy.settings({ GALAXY_REQUIRE_CONTENT_APPROVAL: true });
    cy.login();
    cy.deleteNamespacesAndCollections();
    cy.createApprovalData(2, items, true);
  });

  after(() => {
    //cy.deleteNamespacesAndCollections();
    cy.settings();
  });

  beforeEach(() => {
    cy.login();
  });

  it('should not see items in collections.', () => {
    cy.visit('/ui/repo/published');
    cy.contains('No collections yet');
  });

  it('should approve items.', () => {
    items.forEach((item) => {
      // delete every item in loop
      cy.visit('/ui/approval-dashboard');
      cy.contains('Approval dashboard');
      // this enables cypress test to also view approval button due to
      // error in approval table, that does not scale to window
      cy.get('button[aria-label="Global navigation"]').click();
      cy.get('[data-cy="sort_collection"]').click();

      cy.contains('button', 'Approve').click();
    });
    // wait for finish last approval
    cy.contains('No results found');
  });

  it('should see items in collections.', () => {
    cy.visit('/ui/repo/published?page_size=100');
    items.forEach((item) => {
      cy.contains(item.name);
    });
  });
});
