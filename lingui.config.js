const po = require("@lingui/format-po").formatter({ lineNumbers: false });

export default {
  catalogs: [
    {
      path: '<rootDir>/locale/{locale}',
      include: ['<rootDir>/src'],
    },
  ],
  format: po,
  locales: ['en', 'es', 'fr', 'ko', 'nl', 'ru', 'ja', 'zh'],
  sourceLocale: 'en',
};
