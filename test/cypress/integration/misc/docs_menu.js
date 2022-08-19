describe('Token Management Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login();
  });

  it('user can open docs dropdown menu', () => {
    cy.get('[aria-label="docs-dropdown"]').click();

    cy.get('.pf-c-dropdown__menu')
      .contains('Customer Support')
      .should('have.attr', 'href')
      .and('contain', 'https://access.redhat.com/support');

    cy.get('.pf-c-dropdown__menu')
      .contains('Training')
      .should('have.attr', 'href')
      .and('contain', 'https://www.ansible.com/resources/webinars-training');

    cy.get('.pf-c-dropdown__menu').contains('About');
  });

  it('user can toggle about modal', () => {
    cy.get('[aria-label="docs-dropdown"]').click();
    cy.get('.pf-c-dropdown__menu').contains('About').click();
    cy.get('.pf-c-about-modal-box').should('be.visible');
    cy.get('h1').contains('Galaxy NG');
    cy.get('[aria-label="Close Dialog"]').click();
    cy.get('.pf-c-about-modal-box').should('not.exist');
  });
});
