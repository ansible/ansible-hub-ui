import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { init } from './store';
import App from './loaders/insights/insights-loader';
import getBaseName from './utilities/getBaseName';
import MaintenancePage from './containers/maintenance/maintenance-page';

// Entrypoint for compiling the app to run in insights production mode.

ReactDOM.render(
  <MaintenancePage></MaintenancePage>,
  document.getElementById('root'),
);
