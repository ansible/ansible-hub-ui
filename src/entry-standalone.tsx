import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import 'src/l10n';
import App from './loaders/standalone/loader';

// support common original galaxy urls
// return falsy for default, or an url starting with a slash
function redirect(from) {
  console.debug('pathname outside base path', from);

  // match /namespace/name & /namespace/name/
  if (from.match(/^\/(\w+)\/(\w+)\/?$/)) {
    return '/dispatch/?pathname=' + encodeURIComponent(from);
  }
}

// Entrypoint for compiling the app to run in standalone mode

// react-router v6 won't redirect to base path by default
if (!window.location.pathname.includes(UI_BASE_PATH)) {
  window.history.pushState(
    null,
    null,
    UI_BASE_PATH.replace(/\/$/, '') +
      (redirect(window.location.pathname) || '/'),
  );
}

ReactDOM.render(
  <React.StrictMode>
    <Router basename={UI_BASE_PATH}>
      <I18nProvider i18n={i18n}>
        <App />
      </I18nProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root'),
);
