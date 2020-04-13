import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { init } from './store';
import App from './loaders/insights-loader';
import logger from 'redux-logger';
import getBaseName from './utilities/getBaseName';

// Entrypoint for compiling the app to run in insights dev mode.

ReactDOM.render(
  <Provider store={init(logger).getStore()}>
    <Router basename={getBaseName(window.location.pathname)}>
      <App />
    </Router>
  </Provider>,

  document.getElementById('root'),
);
