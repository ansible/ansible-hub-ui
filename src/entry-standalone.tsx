import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './loaders/standalone/standalone-loader';

// Entrypoint for compiling the app to run in standalone mode (for all deployments
// other than on the insights/cloud services environment)

ReactDOM.render(
  <Router basename={UI_BASE_PATH}>
    <App />
  </Router>,

  document.getElementById('root'),
);
