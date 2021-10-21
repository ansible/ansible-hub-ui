import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import App from './loaders/standalone/standalone-loader';
import 'src/l10n';

// hub-entrypoint for compiling the app to run in standalone mode (for all deployments
// other than on the insights/cloud services environment)

ReactDOM.render(
  <Router basename={UI_BASE_PATH}>
    <I18nProvider i18n={i18n}>
      <App />
    </I18nProvider>
  </Router>,

  document.getElementById('root'),
);
