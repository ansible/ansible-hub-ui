import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './loaders/standalone-loader';

// Entrypoint for compiling the app to run in standalone mode (for all deployments
// other than on the insights/cloud services environment)

ReactDOM.render(
        <Router>
            <App />
        </Router>,

    document.getElementById('root'),
);
