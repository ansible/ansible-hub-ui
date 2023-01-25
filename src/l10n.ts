import { i18n } from '@lingui/core';
import * as plurals from 'make-plural/plurals';
import * as moment from 'moment';

// remember to update .linguirc as well
const availableLanguages = ['en', 'es', 'fr', 'ko', 'nl', 'ja', 'zh'];

async function activate(locale: string, pseudolocalization = false) {
  const { messages } = await import(`src/../locale/${locale}.js`);

  if (pseudolocalization) {
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

  moment.locale(locale);
}

// Accept-Language
const userLanguage = navigator.languages
  .map((lang) => lang.replace(/[-_].*/, ''))
  .filter((lang) => availableLanguages.includes(lang))[0];

const searchParams = Object.fromEntries(
  new URLSearchParams(window.location.search),
);

if (searchParams.pseudolocalization === 'true') {
  window.localStorage.test_l10n = 'true';
}
if (searchParams.pseudolocalization === 'false') {
  delete window.localStorage.test_l10n;
}

if (searchParams.lang) {
  window.localStorage.override_l10n = searchParams.lang;
}
if (searchParams.lang === '') {
  delete window.localStorage.override_l10n;
}

const overrideLanguage =
  window.localStorage.override_l10n &&
  availableLanguages.includes(window.localStorage.override_l10n) &&
  window.localStorage.override_l10n;
const language = overrideLanguage || userLanguage || 'en';
const pseudolocalization = window.localStorage.test_l10n === 'true';

if (overrideLanguage) {
  console.debug(
    `language autodetection overriden to: ${overrideLanguage}, unset by visiting ${
      window.location.origin + window.location.pathname + '?lang='
    }`,
  );
}
if (pseudolocalization) {
  console.debug(
    `pseudolocalization enabled, unset by visiting ${
      window.location.origin +
      window.location.pathname +
      '?pseudolocalization=false'
    }`,
  );
}

activate(language, pseudolocalization);
