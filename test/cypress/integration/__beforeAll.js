import { createYield } from 'typescript';

describe('Dump database', () => {
  it('dumps database.', () => {
    cy.dumpDatabase();
  });
});
