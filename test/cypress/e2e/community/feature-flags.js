const apiPrefix = Cypress.env('apiPrefix');

describe('Feature flags', () => {
  it('match expectations', () => {
    cy.request(`${apiPrefix}_ui/v1/feature-flags/`).then(({ body }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(body._messages).to.be.empty;
      expect(body).to.include({ ai_deny_index: true });
      expect(body).to.include({ can_create_signatures: false });
      expect(body).to.include({ can_upload_signatures: false });
      expect(body).to.include({ collection_auto_sign: false });
      expect(body).to.include({ collection_signing: false });
      expect(body).to.include({ container_signing: false });
      expect(body).to.include({ display_repositories: false });
      expect(body).to.include({ display_signatures: false });
      expect(body).to.include({ execution_environments: false });
      expect(body).to.include({ external_authentication: true });
      expect(body).to.include({ legacy_roles: true });
      expect(body).to.include({ require_upload_signatures: false });
      expect(body).to.include({ signatures_enabled: false });
    });
  });
});
