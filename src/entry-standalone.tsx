import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import 'src/l10n';
import App from './loaders/standalone/loader';

// Entrypoint for compiling the app to run in standalone mode

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
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Router basename={UI_BASE_PATH}>
      <I18nProvider i18n={i18n}>
        <App />
      </I18nProvider>
    </Router>
  </React.StrictMode>,
);
