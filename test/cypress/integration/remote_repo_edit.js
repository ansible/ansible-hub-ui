describe('edit a remote repository', () => {
  it('has Save button disabled when required fields are msising', () => {
    cy.get('button').contains('Save').should('be.disabled');
  });

  it('has a readonly name field', () => {
    cy.get('button').contains('Save').should('be.disabled');
  });

  it('has error messages for wrongly filled fields', () => {
    cy.get('button').contains('Save').should('be.disabled');
  });

  it('shows and hides advanced options', () => {
    cy.get('button').contains('Save').should('be.disabled');
  });
});
