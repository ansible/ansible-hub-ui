import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import 'src/l10n';
import App from './loaders/standalone/loader';

// Entrypoint for compiling the app to run in standalone mode

if (!window.location.pathname.includes(UI_BASE_PATH)) {
  // react-router v6 won't redirect to base path by default
  window.history.pushState(null, null, UI_BASE_PATH);
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
