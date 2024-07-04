const apiPrefix = Cypress.env('apiPrefix');

describe('Feature flags', () => {
  it('match expectations', () => {
    cy.request(`${apiPrefix}_ui/v1/feature-flags/`).then(({ body }) => {
      expect(body._messages).to.be.empty;
      expect(body).to.include({ ai_deny_index: false });
      expect(body).to.include({ can_create_signatures: true });
      expect(body).to.include({ can_upload_signatures: false });
      expect(body).to.include({ collection_auto_sign: true });
      expect(body).to.include({ collection_signing: true });
      expect(body).to.include({ display_repositories: true });
      expect(body).to.include({ display_signatures: true });
      expect(body).to.include({ legacy_roles: false });
      expect(body).to.include({ require_upload_signatures: false });
      expect(body).to.include({ signatures_enabled: true });
    });
  });
});
