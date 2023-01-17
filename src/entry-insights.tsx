import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import React from 'react';
import 'src/l10n';
import App from './loaders/insights/loader';

// Entrypoint for compiling the app to run in insights mode.

const AnsibleHub = () => (
  <React.StrictMode>
    <I18nProvider i18n={i18n}>
      <App />
    </I18nProvider>
  </React.StrictMode>
);

// ignore unused exports default
export default AnsibleHub;
