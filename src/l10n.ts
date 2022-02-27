import { i18n } from '@lingui/core';
import * as plurals from 'make-plural/plurals';

const availableLanguages = ['en', 'es', 'fr', 'nl', 'ja', 'zh'];

// Accept-Language
export const userLanguage =
  navigator.languages
    .map((lang) => lang.replace(/[-_].*/, ''))
    .filter((lang) => availableLanguages.includes(lang))[0] || 'en';

async function activate(locale: string) {
  const { messages } = await import(`src/../locale/${locale}.js`);

  if (window.localStorage.test_l10n === 'true') {
    Object.keys(messages).forEach((key) => {
      if (Array.isArray(messages[key])) {
        // t`Foo ${param}` -> ["Foo ", ['param']] => [">>", "Foo ", ['param'], "<<"]
        messages[key] = ['»', ...messages[key], '«'];
      } else {
        // simple string
        messages[key] = '»' + messages[key] + '«';
      }
    });
  }

  i18n.loadLocaleData(locale, { plurals: plurals[locale] });
  i18n.load(locale, messages);
  i18n.activate(locale);
}

activate(userLanguage);
