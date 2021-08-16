import { i18n } from '@lingui/core';

// import plural rules for all locales
import { en, cs } from 'make-plural/plurals';

i18n.loadLocaleData('en', { plurals: en });
i18n.loadLocaleData('cs', { plurals: cs });

/**
 * Load messages for requested locale and activate it.
 * This function isn't part of the LinguiJS library because there are
 * many ways how to load messages — from REST API, from file, from cache, etc.
 */
async function activate(locale: string) {
  const { messages } = await import(`src/../locale/${locale}.js`);
  console.log('activate', locale, messages);

  if (window.localStorage.test_l10n === 'true') {
    Object.keys(messages).forEach(
      (key) => (messages[key] = '»' + messages[key] + '«'),
    );
  }

  i18n.load(locale, messages);
  i18n.activate(locale);
}

activate('cs');
window.activate = activate; //TODO
