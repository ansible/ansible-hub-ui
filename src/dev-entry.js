import React from 'react';
import { Provider } from 'react-redux';
import logger from 'redux-logger';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { init } from './store';
import App from './loaders/insights/insights-loader';
import 'src/l10n';

// Entrypoint for compiling the app to run in insights production mode.

const AnsibleHub = () => (
  <React.StrictMode>
    <Provider store={init(logger).getStore()}>
      <I18nProvider i18n={i18n}>
        <App />
      </I18nProvider>
    </Provider>
  </React.StrictMode>
);

export default AnsibleHub;
