import { defineConfig } from '@lingui/cli';
import { formatter } from '@lingui/format-po';

export default defineConfig({
  catalogs: [
    {
      path: '<rootDir>/locale/{locale}',
      include: ['<rootDir>/src'],
    },
  ],
  format: formatter({ lineNumbers: false }),
  locales: ['en', 'es', 'fr', 'ja', 'ko', 'nl', 'ru', 'zh'],
  sourceLocale: 'en',
});
