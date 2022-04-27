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
  const helper = languageCheckHelper('/ui/repositories', 'h1');

  beforeEach(() => {
    cy.login();
  });

  const translations = {
    en: 'Repo Management',
    fr: 'Gestion de référentiel',
    ja: 'リポジトリー管理',
    zh: '仓库管理',
  };

  Object.entries(translations).forEach(([language, message]) => {
    it(`should display the correct translation in ${language}`, () => {
      helper(language, message);
    });
  });
});

describe('Localization tests with the <Trans> format', () => {
  const helper = languageCheckHelper(
    '/ui/containers',
    '[data-cy="push-images-button"]',
  );

  beforeEach(() => {
    cy.login();
  });

  const translations = {
    en: 'Push container images',
    fr: 'Pousser images de conteneurs',
    ja: 'コンテナーイメージのプッシュ',
    zh: '推容器镜像',
  };

  Object.entries(translations).forEach(([language, message]) => {
    it(`should display the correct translation in ${language}`, () => {
      helper(language, message);
    });
  });
});
