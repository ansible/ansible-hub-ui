const JsLexer = [{ lexer: 'JavascriptLexer', functions: ['t', 'N_'] }];
const JsxLexer = [{ lexer: 'JsxLexer', functions: ['t', 'N_'] }];
const lexers = {
  js: JsLexer,
  jsx: JsxLexer,
  ts: JsLexer,
  tsx: JsxLexer,
};

// remember to update .linguirc & src/l10n.ts availableLanguages as well
const locales = ["en", "es", "fr", "ko", "nl", "ja", "zh"];

// https://github.com/i18next/i18next-parser#options
export default {
  createOldCatalogs: false,
  input: ['src/**/*.{js,jsx,ts,tsx}'],
  keySeparator: false,
  lexers,
  locales,
  namespaceSeparator: false,
  output: 'locale/$LOCALE.json',
  sort: true,
}
