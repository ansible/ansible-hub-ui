import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// don't want to use this?
// have a look at the Quick start guide
// for passing in lng and translations on init

const en = require('../locale/en.json');

const messages = en;

window.localStorage.test_l10n = true;

if (window.localStorage.test_l10n === 'true') {
  Object.keys(messages).forEach((key) => {
    // simple string
    messages[key] = '»' + messages[key] + '«';
  });
}

i18next.use(initReactI18next);
i18next.use(LanguageDetector);
i18next.init({
  interpolation: { escapeValue: false },
  debug: true,
  fallbackLng: 'en',
  resources: {
    en: {
      translation: en,
    },
  },
  keySeparator: false,
  nsSeparator: false,
});
