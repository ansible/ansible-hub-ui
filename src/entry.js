import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { init } from './store';
import App from './loaders/insights/insights-loader';
import getBaseName from './utilities/getBaseName';
import 'src/l10n';

// hub-entrypoint for compiling the app to run in insights production mode.

const basename = getBaseName(window.location.pathname);

ReactDOM.render(
  <Provider store={init().getStore()}>
    <Router basename={basename}>
      <I18nProvider i18n={i18n}>
        <App basename={basename} />
      </I18nProvider>
    </Router>
  </Provider>,

  document.getElementById('root'),
);
