import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import logger from 'redux-logger';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { init } from './store';
import App from './loaders/insights/insights-loader';
import 'src/l10n';

// Entrypoint for compiling the app to run in insights production mode.

const AnsibleHub = () => (
  <Provider store={init(logger).getStore()}>
    <Router basename={UI_BASE_PATH}>
      <I18nProvider i18n={i18n}>
        <App basename={UI_BASE_PATH} />
      </I18nProvider>
    </Router>
  </Provider>
);

export default AnsibleHub;
