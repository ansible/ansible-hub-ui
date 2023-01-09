import React from 'react';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import App from './loaders/insights/loader';
import 'src/l10n';

// Entrypoint for compiling the app to run in insights mode.

const AnsibleHub = () => (
  <React.StrictMode>
    <I18nProvider i18n={i18n}>
      <App />
    </I18nProvider>
  </React.StrictMode>
);

export default AnsibleHub;
