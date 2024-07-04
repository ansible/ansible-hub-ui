const uiPrefix = Cypress.env('uiPrefix');

// Note up to date there is no translation for any string in 'es' and 'nl'.
const languageCheckHelper = (url, selector) => (language, message) => {
  cy.visit(url, {
    onBeforeLoad(win) {
      if (language) {
        Object.defineProperty(win.navigator, 'languages', {
          value: [language],
        });
      }
    },
  });

  cy.get(selector).should('contain.text', message);
};

describe('Localization tests with the t`String` format', () => {
  const helper = languageCheckHelper(`${uiPrefix}tasks`, 'h1');

  beforeEach(() => {
    cy.login();
  });

  const translations = {
    en: 'Task management',
    fr: 'Gestion des tâches',
    ja: 'タスク管理',
    zh: '任务管理',
  };

  Object.entries(translations).forEach(([language, message]) => {
    it(`should display the correct translation in ${language}`, () => {
      helper(language, message);
    });
  });
});
