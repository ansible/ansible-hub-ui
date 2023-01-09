import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import App from './loaders/standalone/loader';
import 'src/l10n';

// Entrypoint for compiling the app to run in standalone mode

if (!window.location.pathname.includes(UI_BASE_PATH)) {
  // react-router v6 won't redirect to base path by default
  window.history.pushState(null, null, UI_BASE_PATH);
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
