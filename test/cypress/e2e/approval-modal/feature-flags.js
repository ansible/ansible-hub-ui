const apiPrefix = Cypress.env('apiPrefix');

describe('Feature flags', () => {
  it('returns expected feature flags', () => {
    cy.request(`${apiPrefix}_ui/v1/feature-flags/`).then(({ body }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(body._messages).to.be.empty;

      // Validate that all expected feature flags are present (values may vary by environment)
      const expectedFlags = [
        'ai_deny_index',
        'can_create_signatures',
        'can_upload_signatures',
        'collection_auto_sign',
        'collection_signing',
        'container_signing',
        'display_repositories',
        'display_signatures',
        'execution_environments',
        'legacy_roles',
        'require_upload_signatures',
        'signatures_enabled',
      ];

      expectedFlags.forEach((flag) => {
        expect(body).to.have.property(flag);
        expect(typeof body[flag]).to.equal('boolean');
      });
    });
  });
});
