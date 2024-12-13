import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import 'src/l10n';
import App from './loaders/standalone/loader';

// Entrypoint for compiling the app to run in standalone mode

const searchParams = new URLSearchParams(window.location.search);
if (!window.location.pathname.startsWith(UI_BASE_PATH)) {
  // react-router v6 won't redirect to base path by default
  // also support old-galaxy /namespace/name/ urls
  const originalPath = window.location.pathname;
  const newPath = originalPath.match(/^\/(\w+)\/(\w+)\/?$/)
    ? UI_BASE_PATH.replace(
        /\/$/,
        '/dispatch/?pathname=' + encodeURIComponent(originalPath),
      )
    : UI_BASE_PATH;

  window.history.pushState(null, null, newPath);
} else if (searchParams.has('lang') || searchParams.has('pseudolocalization')) {
  // delete lang after src/l10n uses it
  searchParams.delete('lang');
  searchParams.delete('pseudolocalization');
  window.history.pushState(
    null,
    null,
    window.location.pathname +
      (searchParams.toString() ? '?' + searchParams.toString() : ''),
  );
}

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <Router basename={UI_BASE_PATH}>
      <I18nProvider i18n={i18n}>
        <App />
      </I18nProvider>
    </Router>
  </StrictMode>,
);
